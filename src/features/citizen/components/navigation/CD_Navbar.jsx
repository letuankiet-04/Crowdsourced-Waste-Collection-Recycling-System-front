
import useStoredUser from "../../../../shared/hooks/useStoredUser.js";

export default function CD_Navbar({ brandTitle = "" }) {
  const { displayName, roleLabel, user } = useStoredUser();

  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";
  const roleDisplay = roleLabel ? roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1).toLowerCase() : "User";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full pl-6 pr-6 sm:pr-8 lg:pr-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="text-lg font-extrabold text-gray-900 tracking-tight">{brandTitle}</div>
          </div>
          <div className="flex items-center gap-8">
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
