import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../../../../shared/ui/Card.jsx";

export function PointsSummary({ pointsData = { totalPoints: 0, monthlyPoints: 0 } }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Points Card */}
      <Card className="p-8 relative overflow-hidden">
         <div className="relative z-10">
            <p className="text-gray-500 text-sm font-medium mb-2">Total Points</p>
            <div className="flex items-baseline gap-2">
               <span className="text-5xl font-bold text-gray-900">{pointsData.totalPoints}</span>
               <span className="text-green-600 font-semibold">pts</span>
            </div>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
               +{pointsData.monthlyPoints} this month
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
  );
}
