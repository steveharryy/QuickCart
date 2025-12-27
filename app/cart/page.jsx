'use client';

import React from "react";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import OrderSummary from "../../components/OrderSummary";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";

const Cart = () => {
  const {
    products,
    router,
    cartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
  } = useAppContext();

  return (
    <>
      <Navbar />

      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        {/* LEFT SIDE */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b-2 border-blue-600 pb-6">
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              Your <span className="text-blue-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl font-semibold text-gray-700">
              {getCartCount()} Items
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="pb-6 px-2 text-gray-600 font-medium">
                    Product Details
                  </th>
                  <th className="pb-6 px-2 text-gray-600 font-medium">
                    Price
                  </th>
                  <th className="pb-6 px-2 text-gray-600 font-medium">
                    Quantity
                  </th>
                  <th className="pb-6 px-2 text-gray-600 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>

              <tbody>
                {Object.keys(cartItems).map((productId) => {
                  // ✅ IMPORTANT: match by product.id (UUID)
                  const product = products.find(
                    (p) => p.id === productId
                  );

                  if (!product || cartItems[productId] <= 0) return null;

                  const quantity = cartItems[productId];
                  const price = product.offer_price ?? product.price;

                  return (
                    <tr key={productId}>
                      {/* PRODUCT */}
                      <td className="flex items-center gap-4 py-4 px-2">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-100 p-2">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          </div>

                          <button
                            className="md:hidden text-xs text-blue-600 mt-1 font-medium"
                            onClick={() =>
                              updateCartQuantity(product.id, 0)
                            }
                          >
                            Remove
                          </button>
                        </div>

                        <div className="hidden md:block">
                          <p className="text-gray-800 font-semibold">
                            {product.name}
                          </p>
                          <button
                            className="text-xs text-blue-600 mt-1 font-medium"
                            onClick={() =>
                              updateCartQuantity(product.id, 0)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="py-4 px-2 text-gray-600">
                        ${price.toFixed(2)}
                      </td>

                      {/* QUANTITY */}
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                product.id,
                                quantity - 1
                              )
                            }
                          >
                            <Image
                              src={assets.decrease_arrow}
                              alt="decrease"
                              width={16}
                              height={16}
                            />
                          </button>

                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) =>
                              updateCartQuantity(
                                product.id,
                                Number(e.target.value)
                              )
                            }
                            className="w-10 border text-center"
                          />

                          <button
                            onClick={() => addToCart(product.id)}
                          >
                            <Image
                              src={assets.increase_arrow}
                              alt="increase"
                              width={16}
                              height={16}
                            />
                          </button>
                        </div>
                      </td>

                      {/* SUBTOTAL */}
                      <td className="py-4 px-2 text-gray-600">
                        ${(price * quantity).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => router.push("/all-products")}
            className="group flex items-center mt-6 gap-2 text-blue-600 font-semibold"
          >
            <Image
              src={assets.arrow_right_icon_colored}
              alt="continue"
            />
            Continue Shopping
          </button>
        </div>

        {/* RIGHT SIDE */}
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
