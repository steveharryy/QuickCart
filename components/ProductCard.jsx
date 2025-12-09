import React from 'react'
import { assets } from '../assets/assets'
import Image from 'next/image';
import { useAppContext } from '../context/AppContext';

const ProductCard = ({ product }) => {

    const { currency, router } = useAppContext()

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-1 max-w-[240px] w-full cursor-pointer group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
        >
            <div className="cursor-pointer relative bg-gradient-to-br from-blue-50 to-gray-50 w-full h-56 flex items-center justify-center overflow-hidden">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-110 transition-transform duration-300 object-cover w-4/5 h-4/5"
                    width={800}
                    height={800}
                />
                <button onClick={(e) => { e.stopPropagation(); }} className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-lg hover:bg-blue-50 transition">
                    <Image
                        className="h-4 w-4"
                        src={assets.heart_icon}
                        alt="heart_icon"
                    />
                </button>
            </div>

            <div className="p-4 w-full">
                <p className="text-base font-semibold text-gray-800 w-full truncate">{product.name}</p>
                <p className="w-full text-xs text-gray-500 mt-1 max-sm:hidden truncate">{product.description}</p>
                <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs font-medium text-gray-700">{4.5}</p>
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Image
                                key={index}
                                className="h-3 w-3"
                                src={
                                    index < Math.floor(4)
                                        ? assets.star_icon
                                        : assets.star_dull_icon
                                }
                                alt="star_icon"
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between w-full mt-3">
                    <p className="text-xl font-bold text-blue-600">{currency}{product.offerPrice}</p>
                    <button onClick={(e) => { e.stopPropagation(); }} className="max-sm:hidden px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition">
                        Buy now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard