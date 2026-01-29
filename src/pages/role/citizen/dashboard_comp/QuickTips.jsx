export default function QuickTips() {
  return (
    <div className="relative overflow-hidden bg-green-50 rounded-2xl p-8 border border-green-100 transition-all duration-300 hover:shadow-md hover:bg-green-100/50 group">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] pointer-events-none" />
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-green-200/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

      <div className="relative z-10 flex items-center gap-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 animate-float" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
        </svg>
        <h4 className="font-bold text-green-800 text-base uppercase">QUICK TIP</h4>
      </div>
      <p className="text-green-800 text-base leading-relaxed">
        Sorting waste at the source increases recycling efficiency by <span className="font-bold">30%</span>. Start today!
      </p>
    </div>
  );
}
