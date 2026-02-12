import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from "../../../routes/paths.js";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import Header from "../../../components/layout/CD_Header.jsx";
import CD_Footer from "../../../components/layout/CD_Footer.jsx";
import RoleLayout from "../../../components/layout/RoleLayout.jsx";
import { Card } from "../../../components/ui/Card.jsx";


const MOCK_VOUCHERS = [
  {
    id: 1,
    title: "20% Off Eco-Store",
    vendor: "Green Living Shop",
    date: "2023-10-15",
    status: "Available",
    icon: "store"
  },
  {
    id: 2,
    title: "Free Bus Ride",
    vendor: "City Transit",
    date: "2023-09-28",
    status: "Used",
    icon: "transport"
  },
  {
    id: 3,
    title: "Buy 1 Get 1 Coffee",
    vendor: "Local Brews",
    date: "2023-08-10",
    status: "Expired",
    icon: "food"
  },
   {
    id: 4,
    title: "10% Off Grocery",
    vendor: "Organic Market",
    date: "2023-11-01",
    status: "Available",
    icon: "store"
  },
];

export default function CitizenRewards() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredVouchers = useMemo(() => {
    if (filterStatus === "All") return MOCK_VOUCHERS;
    return MOCK_VOUCHERS.filter(v => v.status === filterStatus);
  }, [filterStatus]);

  const getStatusColor = (status) => {
      switch(status) {
          case 'Available': return 'bg-green-100 text-green-800 border-green-200';
          case 'Used': return 'bg-gray-100 text-gray-600 border-gray-200';
          case 'Expired': return 'bg-red-100 text-red-600 border-red-200';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      showBackgroundEffects
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <br />
          <CD_Footer />
        </div>
      }
    >

      <div className="space-y-10 mt-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Rewards</h1>
          <p className="text-gray-500 mt-2">Manage your sustainability points and discover exclusive rewards from our eco-friendly partners.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Points Card */}
          <Card className="p-8 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-gray-500 text-sm font-medium mb-2">Total Points</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-5xl font-bold text-gray-900">Wait API</span>
                   <span className="text-green-600 font-semibold">pts</span>
                </div>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                   </svg>
                   Wait API this month
                </div>
             </div>
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-green-100 rounded-full opacity-50 blur-2xl"></div>
          </Card>

          {/* Points History Card */}
          <Card className="p-8 flex flex-col justify-center items-start relative overflow-hidden">
             <div className="relative z-10 w-full flex items-center justify-between">
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-lg">Points History</h3>
                      <p className="text-gray-500 text-sm mt-1">Review your earned points and past redemptions.</p>
                   </div>
                </div>
                <button 
                  onClick={() => navigate('/citizen/points-history')}
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                   View Full History →
                </button>
             </div>
          </Card>
        </div>

        {/* Redeem Gifts Section */}
        <div>
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <span className="text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                 </span>
                 Redeem Gifts
              </h2>
              <button className="text-green-600 font-medium hover:text-green-700">View all</button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gift Card 1 */}
              <Card className="overflow-hidden flex flex-col h-full">
                 <div className="h-48 bg-gray-200 relative">
                    <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-bold text-green-700 shadow-sm">Limited Time</div>
                    {/* Placeholder for image */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                       Wait API (Image)
                    </div>
                 </div>
                 <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ECO-STORE</span>
                       <span className="font-bold text-gray-900">Wait API pts</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Wait API (Title)</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-grow">Wait API (Description)</p>
                    <button className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors">
                       Redeem Now
                    </button>
                 </div>
              </Card>

              {/* Gift Card 2 */}
              <Card className="overflow-hidden flex flex-col h-full">
                 <div className="h-48 bg-gray-200 relative">
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                       Wait API (Image)
                    </div>
                 </div>
                 <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CITY TRANSIT</span>
                       <span className="font-bold text-gray-900">Wait API pts</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Wait API (Title)</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-grow">Wait API (Description)</p>
                    <button className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors">
                       Redeem Now
                    </button>
                 </div>
              </Card>

              {/* Gift Card 3 */}
              <Card className="overflow-hidden flex flex-col h-full">
                 <div className="h-48 bg-gray-200 relative">
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                       Wait API (Image)
                    </div>
                 </div>
                 <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">LOCAL BREWS</span>
                       <span className="font-bold text-gray-900">Wait API pts</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Wait API (Title)</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-grow">Wait API (Description)</p>
                    <button className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors">
                       Redeem Now
                    </button>
                 </div>
              </Card>
           </div>
        </div>

        {/* My Vouchers Section */}
        <div>
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <span className="text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                 </span>
                 My Vouchers
              </h2>
              
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {['All', 'Available', 'Used', 'Expired'].map(status => (
                      <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                              filterStatus === status 
                                  ? 'bg-green-600 text-white shadow-sm' 
                                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                          {status}
                      </button>
                  ))}
              </div>
           </div>

           <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Voucher Details</th>
                          <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Redeemed On</th>
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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            voucher.status === 'Available' ? 'bg-green-100 text-green-600' :
                                            voucher.status === 'Used' ? 'bg-blue-100 text-blue-600' :
                                            'bg-orange-100 text-orange-600'
                                        }`}>
                                           {voucher.icon === 'store' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                           )}
                                           {voucher.icon === 'transport' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                           )}
                                           {voucher.icon === 'food' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                           )}
                                        </div>
                                        <div>
                                           <div className="font-bold text-gray-900">{voucher.title}</div>
                                           <div className="text-xs text-gray-500">{voucher.vendor}</div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="py-4 px-6 text-sm text-gray-500">{voucher.date}</td>
                                  <td className="py-4 px-6">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(voucher.status)}`}>
                                        {voucher.status.toUpperCase()}
                                     </span>
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                     {voucher.status === 'Available' ? (
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
      </div>
    </RoleLayout>
  );
}
