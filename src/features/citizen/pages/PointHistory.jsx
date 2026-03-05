import { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import Header from "../../../shared/layout/CD_Header.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import { Card } from "../../../shared/ui/Card.jsx";
import { getCitizenPoints, getCitizenPointsHistory } from "../../../services/citizen.service.js";

export default function PointHistory() {
  const [activeTab, setActiveTab] = useState('All Activities');
  const [historyData, setHistoryData] = useState([]);
  const [pointsData, setPointsData] = useState({ totalPoints: 0, monthlyPoints: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const [points, history] = await Promise.all([
          getCitizenPoints(),
          getCitizenPointsHistory()
        ]);
        if (points) setPointsData(points);
        if (history && Array.isArray(history)) setHistoryData(history);
        setError('');
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError('Unable to load points history. Please try again.')
      }
    }
    fetchData();
  }, []);

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

      <div className="space-y-8 mt-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Points History</h1>
            <p className="text-gray-500 mt-2">Track your contributions and rewards earned</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>

        {/* Current Balance Card */}
        <Card className="relative overflow-hidden p-0 bg-white">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-transparent pointer-events-none"></div>
          <div className="relative p-8 flex flex-col md:flex-row items-center gap-8">
            {/* Wallet Image Placeholder */}
            <div className="w-full md:w-64 h-40 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-lg flex items-center justify-center text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
               </div>
               {/* Shine effect */}
               <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
            </div>

            <div className="flex-grow space-y-4 w-full text-center md:text-left">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">CURRENT BALANCE</p>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-5xl font-bold text-gray-900">{pointsData.totalPoints}</span>
                  <span className="text-xl font-semibold text-green-600">pts</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2 text-green-600 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span>+{pointsData.monthlyPoints} pts this month</span>
              </div>
            </div>

            <button className="w-full md:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">
              Redeem Rewards
            </button>
          </div>
        </Card>

        {/* Tabs & Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 pt-4 flex gap-8 overflow-x-auto">
            {['All Activities', 'Reports', 'Bonuses', 'Challenges'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors relative ${
                  activeTab === tab 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by activity or ID..."
                className="pl-10 block w-full rounded-xl border-gray-200 bg-white focus:border-green-500 focus:ring-green-500 sm:text-sm py-2.5 shadow-sm"
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                SORT BY:
                <select className="border-none bg-transparent font-bold text-gray-900 focus:ring-0 cursor-pointer p-0">
                  <option>Newest First</option>
                  <option>Oldest First</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap ml-4">
                CATEGORY:
                <select className="border-none bg-transparent font-bold text-gray-900 focus:ring-0 cursor-pointer p-0">
                  <option>All Categories</option>
                  <option>Recyclable</option>
                  <option>Organic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : null}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Waste Category</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyData.map((item, idx) => (
                  <tr key={item.id ?? `${item.date ?? 'date'}-${item.activity ?? 'activity'}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{item.date || new Date().toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${(item.activity || '').includes('Bonus') || (item.activity || '').includes('Hero') ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                           {(item.activity || '').includes('Bonus') || (item.activity || '').includes('Hero') ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.181a1 1 0 011.827.954L16.25 7l2.229 4.177a1 1 0 01-1.827.954L12.75 10.5V14a1 1 0 01-2 0v-3.5l-3.903 1.631-1.827-.954L7.25 7 5.021 2.823a1 1 0 011.827-.954L8.55 5.05V3a1 1 0 011-1z" clipRule="evenodd" />
                             </svg>
                           ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                           )}
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{item.activity || 'Unknown Activity'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                        ${item.category === 'RECYCLABLE' ? 'bg-blue-100 text-blue-700' : ''}
                        ${item.category === 'ORGANIC' ? 'bg-green-100 text-green-700' : ''}
                        ${item.category === 'HAZARDOUS' ? 'bg-red-100 text-red-700' : ''}
                        ${item.category === 'SPECIAL' ? 'bg-purple-100 text-purple-700' : ''}
                        ${item.category === 'N/A' ? 'bg-gray-100 text-gray-600' : ''}
                      `}>
                        {item.category || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-green-600">+{item.points || 0} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {historyData.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{historyData.length}</span> of <span className="font-medium">{historyData.length}</span> entries
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 text-sm font-bold bg-green-500 text-white rounded-lg shadow-sm">1</button>
                <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700" disabled>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
}
