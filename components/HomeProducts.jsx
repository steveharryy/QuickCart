import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

const HomeProducts = () => {

  const { products, router } = useAppContext()

  return (
    <div className="flex flex-col items-center pt-14">
      <div className="flex flex-col items-center mb-8">
        <p className="text-3xl font-bold text-gray-900">Popular Products</p>
        <div className="w-24 h-1 bg-blue-600 mt-2 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 pb-14 w-full">
        {products.map((product, index) => <ProductCard key={index} product={product} />)}
      </div>
      <button onClick={() => { router.push('/all-products') }} className="px-12 py-3 border-2 border-blue-600 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition">
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
