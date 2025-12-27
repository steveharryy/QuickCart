"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loading from "../../components/Loading";
import { useAppContext } from "../../context/AppContext";

const MyOrders = () => {
  const { currency } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />

      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <h2 className="text-lg font-medium mt-6">My Orders</h2>

        {loading ? (
          <Loading />
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="max-w-5xl border-t border-gray-300 text-sm">
            {orders.map((order) => {
              const firstItem = order.items[0];

              return (
                <div
                  key={order.id}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                >
                  {/* PRODUCT SECTION */}
                <div className="flex flex-1 gap-5 min-w-[250px] md:min-w-[350px]">


                    {/* FIXED: display correct image field */}
                    {firstItem?.image_url ? (
                      <Image
                        src={firstItem.image_url}
                        alt={firstItem.name || "Product Image"}
                        width={70}
                        height={70}
                        className="rounded object-cover border"
                      />
                    ) : (
                      <div className="w-[70px] h-[70px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <p className="font-medium text-base">
                        {order.items
                          .map((i) => `${i.name} x ${i.quantity}`)
                          .join(", ")}
                      </p>

                      <p>Items: {order.items.length}</p>
                    </div>
                  </div>

                  {/* ADDRESS SECTION */}
                  <div>
                    <p>
                      <span className="font-medium">
                        {order.addresses?.full_name}
                      </span>
                      <br />
                      <span>{order.addresses?.area}</span>
                      <br />
                      <span>
                        {order.addresses?.city}, {order.addresses?.state}
                      </span>
                      <br />
                      <span>{order.addresses?.phone_number}</span>
                    </p>
                  </div>

                  {/* AMOUNT SECTION */}
                  <p className="font-medium my-auto">
                    {currency}
                    {order.amount}
                  </p>

                  {/* META INFO */}
                  <div className="text-sm flex flex-col">
                    <span>Method: {order.payment_method}</span>
                    <span>
                      Date: {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span>Payment: {order.payment_status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default MyOrders;

