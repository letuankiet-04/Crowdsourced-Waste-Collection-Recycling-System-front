import React, { useState, useMemo } from 'react';
import { Card } from "../../../../components/ui/Card.jsx";
import { MY_VOUCHERS } from "../../../../mock/voucherData.js";

export function MyVouchersSection() {
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredVouchers = useMemo(() => {
    if (filterStatus === "All") return MY_VOUCHERS;
    return MY_VOUCHERS.filter(v => v.status === filterStatus);
  }, [filterStatus]);

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
                           <tr key={voucher.id} className="hover:bg-gray-50/50 transition-colors">
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
                                     <button className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors">
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
    </div>
  );
}
