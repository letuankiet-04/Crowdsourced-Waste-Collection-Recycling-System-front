import React, { useState } from 'react';
import { Voucher } from '../../pages/Voucher.jsx';
import PaginationControls from '../../../../shared/ui/PaginationControls.jsx';
export function RedeemSection({ onRedeem, vouchers = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const itemsPerPage = 6;

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVouchers = vouchers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vouchers.length / itemsPerPage);

  // Smooth scroll and animation logic
  const handlePageChange = (pageNumber) => {
    if (pageNumber === currentPage || isAnimating) return;
    
    setIsAnimating(true);
    
    // Smooth scroll to top of section
    const sectionTop = document.getElementById('redeem-section-top');
    if (sectionTop) {
      sectionTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsAnimating(false);
    }, 300); // Matches CSS transition duration
  };

  const handleRedeemClick = (voucher) => {
      onRedeem(voucher);
  };

  return (
    <div id="redeem-section-top" className="scroll-mt-24">
       <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <span className="text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
             </span>
             Redeem Gifts
          </h2>
       </div>

       <div 
         className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 transition-all duration-300 ease-in-out ${
           isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
         }`}
       >
          {currentVouchers.map((voucher) => (
              <Voucher 
                  key={voucher.id} 
                  voucher={voucher} 
                  className="w-full" 
                  onRedeem={() => handleRedeemClick(voucher)}
              />
          ))}
       </div>

       {/* Pagination Controls */}
       {totalPages > 1 && (
         <div className="mt-8">
           <PaginationControls
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={handlePageChange}
             disabled={isAnimating}
           />
         </div>
       )}
    </div>
  );
}
