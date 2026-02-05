
import useStoredUser from "../../../hooks/useStoredUser";

export default function CD_Navbar({ brandTitle = "Citizen Portal" }) {
  const { displayName, roleLabel, user } = useStoredUser();

  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";
  const roleDisplay = roleLabel ? roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1).toLowerCase() : "User";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full pl-6 pr-6 sm:pr-8 lg:pr-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
           
          </div>
          <div className="flex items-center gap-8">
            <button className="group p-3 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 relative">
              <span className="sr-only">View notifications</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-7 w-7" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
            </button>

            <div className="flex items-center gap-4 pl-8 border-l border-gray-200">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-base font-semibold text-gray-900">{displayName}</span>
                <span className="text-sm text-gray-500">{roleDisplay}</span>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl border-2 border-white shadow-sm transition-transform duration-200 ease-in-out hover:scale-105 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
