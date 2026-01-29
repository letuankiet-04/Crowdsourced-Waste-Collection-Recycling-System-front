export default function CD_Header() {
  return (
    <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow-sm border border-white/50 mb-10 transition-all duration-500 hover:shadow-xl group">
      {/* Background Gradient Blobs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-700 animate-blob" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-700 animate-blob animation-delay-2000" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.3] pointer-events-none" />

      <h1 className="relative z-10 text-4xl font-bold text-gray-900">
        Hello, <span className="text-gradient bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x">User Name</span>.
      </h1>
      <p className="relative z-10 text-gray-500 text-xl mt-3 mb-8">
        Welcome back! Let’s work together to build a cleaner and greener environment.
      </p>
      
      <div className="relative z-10 inline-flex items-center bg-white/60 backdrop-blur-sm border border-blue-100 text-blue-700 px-5 py-4 rounded-xl text-base font-medium transition-transform duration-300 hover:scale-[1.01] hover:bg-white/80 cursor-default shadow-sm group/banner overflow-hidden">
        <div className="absolute inset-0 -translate-x-full group-hover/banner:animate-shimmer bg-gradient-to-r from-transparent via-blue-50/50 to-transparent" />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 animate-bounce text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="relative">
          You currently have <span className="font-bold">3 reports</span> pending.
        </span>
      </div>
    </div>
  );
}
