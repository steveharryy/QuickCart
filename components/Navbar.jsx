"use client";
import React, { useState } from "react";
import {
  assets,
  BagIcon,
  BoxIcon,
  CartIcon,
  HomeIcon,
} from "../assets/assets";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);





const Navbar = () => {
  const { router, user, products, getCartCount } = useAppContext();
  const { openSignIn } = useClerk();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🎤 Voice Recognition Handler
  const startVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Search.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setSearchQuery(spokenText);
    };

    recognition.onerror = (err) => {
      console.log("Voice Search Error:", err);
    };
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-4">
          <Image
            className="cursor-pointer w-28 md:w-32"
            onClick={() => router.push("/")}
            src={assets.logo}
            alt="logo"
          />

          {/* LINKS */}
          <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Home
            </Link>
            <Link
              href="/all-products"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Contact
            </Link>
          </div>

          {/* RIGHT ICONS */}
          <ul className="hidden md:flex items-center gap-5">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:scale-110 transition"
            >
              <Image className="w-5 h-5" src={assets.search_icon} alt="search" />
            </button>

            {/* Cart */}
            <button
              onClick={() => router.push("/cart")}
              className="relative hover:scale-110 transition"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* USER ACCOUNT */}
            {user ? (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Home"
                    labelIcon={<HomeIcon />}
                    onClick={() => router.push("/")}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Products"
                    labelIcon={<BoxIcon />}
                    onClick={() => router.push("/all-products")}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Cart"
                    labelIcon={<CartIcon />}
                    onClick={() => router.push("/cart")}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Orders"
                    labelIcon={<BagIcon />}
                    onClick={() => router.push("/my-orders")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <button
                onClick={openSignIn}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
              >
                <Image src={assets.user_icon} alt="user" />
                Account
              </button>
            )}
          </ul>
        </div>

        {/* SEARCH BAR + VOICE SEARCH */}
        {searchOpen && (
          <div className="px-6 md:px-16 lg:px-32 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-14 border-2 border-blue-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-300 transition"
              />

              {/* 🎤 MIC BUTTON */}
              <button
                onClick={startVoiceSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-125 transition"
              >
               <FontAwesomeIcon icon={faMicrophone} size="lg" />

              </button>

              {/* PRODUCT RESULTS */}
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-600 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                  {filteredProducts.length > 0 ? (
                    <div className="p-2">
                      {filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => {
                            router.push(`/product/${product._id}`);
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                          className="flex items-center gap-4 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                        >
                          <Image
                            src={product.image[0]}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                          />

                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {product.category}
                            </p>
                            <p className="text-blue-600 font-semibold">
                              ${product.offerPrice}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 text-lg">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
