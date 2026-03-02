import React from 'react';
import { Plus, Coins } from 'lucide-react'; // Added Plus icon
import { cn } from '../../../shared/lib/cn';

export function Voucher({ voucher, onRedeem, className, ...props }) {
  if (!voucher) return null;

  const {
    bannerUrl,
    logoUrl,
    value,
    title,
    // validUntil, // Hiding these based on the visual requirement
    pointsRequired,
    // terms // Hiding these based on the visual requirement
  } = voucher;

  return (
    <div 
      className={cn(
        "group bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden w-full max-w-sm border border-gray-100 flex flex-col",
        className
      )} 
      {...props}
    >
      {/* Banner Section */}
      <div className="relative w-full">
        <div className="w-full h-48 overflow-hidden relative z-0">
          <img
            src={bannerUrl}
            alt="Voucher Banner"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        {/* Value Badge - Moved to Top Left */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          <span className="font-bold text-gray-900 text-sm">{value}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title and Logo Row */}
        <div className="flex justify-between items-start gap-3 mb-4">
           <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 flex-1">
            {title}
          </h3>
          <div className="flex-shrink-0">
             <img
              src={logoUrl}
              alt="Brand Logo"
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
          </div>
        </div>

        {/* Footer Row: Points and Add Button */}
        <div className="mt-auto flex items-center justify-between">
            {/* Points */}
            <div className="flex items-center gap-2 text-gray-900">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-sm">
                  <span className="font-bold text-xs">$</span> 
                </div>
                {/* Or use Coins icon if preferred, but image shows a coin/dollar symbol */}
                {/* <Coins size={20} className="text-yellow-500 fill-yellow-500" /> */}
                <span className="font-bold text-lg">{pointsRequired}</span>
            </div>

            {/* Add Button */}
            <button 
              onClick={onRedeem}
              className="w-10 h-10 bg-green-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-2xl flex items-center justify-center transition-colors shadow-md"
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>
        </div>
      </div>
    </div>
  );
}
