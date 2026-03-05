import React, { useState, useMemo } from 'react';
import { Card } from "../../../../shared/ui/Card.jsx";
import { X, QrCode } from "lucide-react"; // Import Icons

export function MyVouchersSection({ vouchers = [] }) {
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedVoucher, setSelectedVoucher] = useState(null); // State for modal

  const qrValue = selectedVoucher
    ? (selectedVoucher.code ?? `VOUCHER-${selectedVoucher.id}`)
    : "";
  const qrImageSrc = selectedVoucher
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`
    : "";

  const filteredVouchers = useMemo(() => {
    if (filterStatus === "All") return vouchers;
    return vouchers.filter(v => v.status === filterStatus);
  }, [filterStatus, vouchers]);

  const getStatusColor = (status) => {
      switch(status) {
          case 'Active': return 'bg-green-100 text-green-800 border-green-200';
          case 'Used': return 'bg-gray-100 text-gray-600 border-gray-200';
          case 'Expired': return 'bg-red-100 text-red-600 border-red-200';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  return (
    <div>
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <span className="text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
             </span>
             My Vouchers
          </h2>
          
          <div className="bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 min-w-max">
                  {['All', 'Active', 'Used', 'Expired'].map(status => (
                      <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${
                              filterStatus === status 
                                  ? 'bg-green-600 text-white shadow-md transform scale-105' 
                                  : 'bg-transparent text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'
                          }`}
                      >
                          {status}
                      </button>
                  ))}
              </div>
          </div>
       </div>

       <Card className="overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Voucher Details</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Valid Date</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {filteredVouchers.length > 0 ? (
                       filteredVouchers.map((voucher) => (
                           <tr 
                             key={voucher.id} 
                             className="hover:bg-gray-50/50 transition-colors"
                           >
                              <td className="py-4 px-6">
                                 <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-100 shadow-sm overflow-hidden bg-white p-1">
                                        <img 
                                            src={voucher.logoUrl} 
                                            alt={voucher.brandName} 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                       <div className="font-bold text-gray-900">{voucher.title}</div>
                                       <div className="flex items-center gap-2 mt-0.5">
                                           <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                               {voucher.value}
                                           </span>
                                           <span className="text-xs text-gray-500">{voucher.brandName}</span>
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-500">{voucher.validDate}</td>
                              <td className="py-4 px-6">
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(voucher.status)}`}>
                                    {voucher.status.toUpperCase()}
                                 </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                 {voucher.status === 'Active' ? (
                                     <button
                                       onClick={() => setSelectedVoucher(voucher)}
                                       className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
                                     >
                                        Use Now
                                     </button>
                                 ) : voucher.status === 'Used' ? (
                                     <button className="px-4 py-1.5 border border-gray-300 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed" disabled>
                                        Claimed
                                     </button>
                                 ) : (
                                     <button className="text-xs font-medium text-gray-500 hover:text-gray-900 underline">
                                        Details
                                     </button>
                                 )}
                              </td>
                           </tr>
                       ))
                   ) : (
                       <tr>
                           <td colSpan="4" className="py-8 text-center text-gray-500">
                               No vouchers found.
                           </td>
                       </tr>
                   )}
                </tbody>
             </table>
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
             <button className="text-sm font-medium text-gray-500 hover:text-gray-900">Show older vouchers</button>
          </div>
       </Card>

       {/* QR Code Modal */}
       {selectedVoucher && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up relative">
             <button 
               onClick={(e) => { e.stopPropagation(); setSelectedVoucher(null); }}
               className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
             >
               <X className="w-5 h-5 text-gray-600" />
             </button>

             <div className="p-8 flex flex-col items-center text-center">
               <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mb-4 -mt-12">
                 <img 
                   src={selectedVoucher.logoUrl} 
                   alt={selectedVoucher.brandName} 
                   className="w-full h-full object-contain"
                 />
               </div>
               
               <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedVoucher.brandName}</h3>
               <p className="text-gray-500 text-sm mb-6">{selectedVoucher.title}</p>

               <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 w-full mb-6">
                 {/* Simulate QR Code with an image API or placeholder */}
                 <img 
                  src={qrImageSrc} 
                   alt="Voucher QR Code" 
                   className="w-48 h-48 mx-auto"
                 />
                 <div className="mt-3 text-xs font-mono font-bold text-gray-400 tracking-widest">
                  {qrValue}
                 </div>
               </div>

               <div className="text-xs text-gray-400">
                 Show this QR code to the cashier to redeem.
                 <br/>
                 Valid until: <span className="font-bold text-gray-600">{selectedVoucher.validDate}</span>
               </div>
             </div>
             
             <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-center">
                <button 
                  onClick={() => setSelectedVoucher(null)}
                  className="text-sm font-bold text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
