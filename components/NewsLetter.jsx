import React from "react";

const NewsLetter = () => {
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
          type="text"
          placeholder="Enter your email id"
        />
        <button className="md:px-12 px-8 h-full text-white bg-blue-600 font-semibold hover:bg-blue-700 transition">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default NewsLetter;
