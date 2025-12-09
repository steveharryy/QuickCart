"use client";

import React, { useState } from "react";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      setMessage("Please enter an email");
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setMessage("Failed to send email");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 pt-8 pb-14">
      <h1 className="md:text-4xl text-2xl font-bold text-gray-900">
        Subscribe now & get 20% off
      </h1>
      <p className="md:text-base text-gray-600 pb-8">
        Join our newsletter and be the first to know about exclusive deals and new arrivals.
      </p>

      <div className="flex items-center justify-between max-w-2xl w-full md:h-14 h-12 shadow-lg rounded-lg overflow-hidden">
        <input
          className="border-2 border-blue-600 h-full outline-none w-full px-4 text-gray-700"
          type="email"
          placeholder="Enter your email id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />


        <button
          onClick={handleSubscribe}
          className="md:px-12 px-8 h-full text-white bg-blue-600 font-semibold hover:bg-blue-700 transition"
        >
          Subscribe
        </button>
      </div>

      {message && (
        <p className="text-sm text-gray-700 mt-4">
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsLetter;
