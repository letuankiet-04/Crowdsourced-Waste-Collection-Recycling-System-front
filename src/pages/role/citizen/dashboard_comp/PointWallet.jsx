export default function PointWallet() {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-lg group">
      {/* Wait API Overlay */}
      <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-opacity duration-500">
         <div className="bg-white/90 p-5 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center animate-fade-in-up">
           <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 animate-pulse">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <h4 className="text-lg font-bold text-gray-800">Wait API</h4>
         </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full opacity-50 transition-transform duration-500 group-hover:scale-110" />

      <div className="relative flex justify-between items-start mb-6 opacity-40 filter blur-[1px]">
        <h4 className="text-gray-500 font-semibold text-base uppercase tracking-wider">Point Wallet</h4>
        <div className="p-3 bg-green-50 rounded-xl text-green-600 transition-transform duration-300 hover:rotate-12 shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        </div>
      </div>
      
      <div className="relative flex items-baseline gap-2 mb-8 opacity-40 filter blur-[1px]">
        <span className="text-5xl font-bold text-gray-900 tracking-tight">2026</span>
        <span className="text-green-600 font-semibold text-lg">PTS</span>
      </div>

      <button className="relative w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium text-lg hover:bg-gray-800 transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 overflow-hidden group/btn opacity-40 filter blur-[1px] pointer-events-none">
        <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 group-hover/btn:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="relative">Point history</span>
      </button>
    </div>
  );
}
