
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../services/auth.service.js";
import { updateCollectorPresence } from "../../../services/collector.service.js";
import useStoredUser from "../../hooks/useStoredUser.js";
import { PATHS } from "../../../app/routes/paths.js";

const baseButtonClassName =
  "flex w-full items-center px-4 py-3.5 text-base font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 ease-in-out hover:translate-x-1 hover:scale-[1.02] group";

const baseIconClassName = "h-6 w-6 mr-3 transition-transform duration-200 group-hover:scale-110";

export default function SidebarLogoutButton({
  to = PATHS.home,
  replace = true,
  onLoggedOut,
  label = "Logout",
  className = "",
  iconClassName = "",
}) {
  const navigate = useNavigate();
  const { user, clearAuth } = useStoredUser();

  return (
    <button
      className={`${baseButtonClassName} ${className}`.trim()}
      type="button"
      onClick={() => {
        void (async () => {
          try {
            if (String(user?.role || "").toUpperCase() === "COLLECTOR") {
              await updateCollectorPresence({ status: "OFFLINE" });
            }
          } catch (err) {
            void err;
          }
          try {
            await logout();
          } catch (err) {
            void err;
          }
          clearAuth();
          onLoggedOut?.();
          navigate(to, { replace });
        })();
      }}
      aria-label={typeof label === "string" ? label : "Logout"}
    >
      <LogOut className={`${baseIconClassName} ${iconClassName}`.trim()} aria-hidden="true" />
      {label}

    </button>
  );
}
