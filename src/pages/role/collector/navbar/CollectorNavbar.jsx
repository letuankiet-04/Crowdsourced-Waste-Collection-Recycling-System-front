import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../../api/auth.js";
import useStoredUser from "../../../../hooks/useStoredUser.js";
import { PATHS } from "../../../../routes/paths.js";
import UserMenu from "../../../../components/ui/UserMenu.jsx";

export default function CollectorNavbar() {
  const { displayName, roleLabel, clearAuth } = useStoredUser();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-end h-20">
          <div className="flex items-center gap-4">
            <button
              className="p-3 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-full transition relative"
              type="button"
              aria-label="View notifications"
            >
              <Bell className="h-7 w-7" aria-hidden="true" />
              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <UserMenu
              displayName={displayName}
              roleLabel={roleLabel}
              links={[
                { to: PATHS.collector.profile, label: "Profile" },
                { to: PATHS.collector.history, label: "Work History" },
              ]}
              onLogout={() => {
                void (async () => {
                  try {
                    await logout();
                  } catch (err) {
                    void err;
                  }
                  clearAuth();
                  navigate(PATHS.auth.login, { replace: true });
                })();
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
