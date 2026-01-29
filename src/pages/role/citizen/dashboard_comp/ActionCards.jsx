import { Link } from "react-router-dom";

export default function ActionCards() {
  const actions = [
    {
      title: "New report",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      link: "/create-report",
      bgColor: "bg-green-500",
      iconColor: "text-white",
    },
    {
      title: "My reward",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      link: "/rewards",
      bgColor: "bg-blue-500",
      iconColor: "text-white",
    },
    {
      title: "Feedback",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      link: "/feedback",
      bgColor: "bg-orange-500",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {actions.map((action, index) => (
        <Link 
          to={action.link} 
          key={index} 
          className="block group"
        >
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 h-64 overflow-hidden group/card">
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${action.bgColor.replace('bg-', 'bg-gradient-to-br from-white to-')}`} />
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover/card:animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none" />

            <div className={`relative z-10 w-20 h-20 rounded-2xl ${action.bgColor} ${action.iconColor} flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-${action.bgColor.replace('bg-', '')}/50 ring-4 ring-white/50`}>
              {action.icon}
            </div>
            <span className="relative z-10 font-semibold text-gray-900 text-lg transition-colors duration-300 group-hover:text-gray-900">
              {action.title}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
