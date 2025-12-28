"use client";
import { useAppContext } from "../context/AppContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    products,
    cartItems,
    setCartItems,
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Fetch Addresses
  const fetchUserAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();

      if (data.success) {
        setUserAddresses(data.addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

const createOrder = async () => {
  if (!selectedAddress) {
    toast.error("Please select a delivery address");
    return;
  }

  if (getCartCount() === 0) {
    toast.error("Your cart is empty");
    return;
  }

  setLoading(true);

  try {
    // ✅ Build checkout items correctly
    const orderItems = Object.entries(cartItems).map(
      ([productId, quantity]) => ({
        product_id: productId,
        quantity,
      })
    );

    if (paymentMethod === "COD") {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          addressId: selectedAddress.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to place order");
        return;
      }

      setCartItems({});
      toast.success("Order placed successfully!");
      router.push("/order-placed");
    }

    if (paymentMethod === "Stripe") {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          addressId: selectedAddress.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create checkout session");
        return;
      }

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchUserAddresses();
  }, []);

  return (
    <div className="w-full md:w-96 bg-gradient-to-br from-blue-50 to-gray-50 p-6 rounded-xl border-2 border-blue-100 shadow-lg">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
        Order Summary
      </h2>

      <hr className="border-blue-200 my-5" />

      <div className="space-y-6">
        {/* Address Dropdown */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>

          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.full_name}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>

              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address) => (
                  <li
                    key={address.id}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.full_name}, {address.area}, {address.city},{" "}
                    {address.state}
                  </li>
                ))}

                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-3">
            Payment Method
          </label>

          <div className="space-y-3">
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                paymentMethod === 'COD'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'COD' ? 'border-blue-600' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'COD' && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when you receive</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            <div
              onClick={() => setPaymentMethod('Stripe')}
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                paymentMethod === 'Stripe'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'Stripe' ? 'border-blue-600' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'Stripe' && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Card / UPI</p>
                  <p className="text-xs text-gray-500">Pay securely with Stripe</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">
              Items {getCartCount()}
            </p>
            <p className="text-gray-800">{currency + getCartAmount()}</p>
          </div>

          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>

          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>

          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {getCartAmount() +
                Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3.5 mt-5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (paymentMethod === 'Stripe' ? 'Redirecting to Payment...' : 'Placing Order...') : (paymentMethod === 'Stripe' ? 'Proceed to Payment' : 'Place Order')}
      </button>
    </div>
  );
};

export default OrderSummary;
