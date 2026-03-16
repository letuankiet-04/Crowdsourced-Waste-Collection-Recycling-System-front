import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useStoredUser from "../../../../shared/hooks/useStoredUser.js";
import { PATHS } from "../../../../app/routes/paths.js";
import UserMenu from "../../../../shared/ui/UserMenu.jsx";
import useNotify from "../../../../shared/hooks/useNotify.js";
import { cn } from "../../../../shared/lib/cn.js";
import { readCollectorPresence, clearCollectorPresence, writeCollectorPresence } from "../../../../shared/lib/collectorPresenceStorage.js";
import { updateCollectorPresence } from "../../../../services/collector.service.js";
import useLogout from "../../../../shared/hooks/useLogout.js";

export default function CollectorNavbar() {
  const notify = useNotify();
  const { user, displayName, roleLabel } = useStoredUser();
  const logoutAndRedirect = useLogout();
  const initialOnline = useMemo(() => (user ? readCollectorPresence() ?? false : false), [user]);
  const [online, setOnline] = useState(() => readCollectorPresence() ?? false);
  const [presencePending, setPresencePending] = useState(false);

  useEffect(() => {
    setOnline(initialOnline);
  }, [initialOnline]);

  async function handleTogglePresence() {
    if (presencePending) return;
    const nextOnline = !online;
    setPresencePending(true);
    try {
      await notify.promise(updateCollectorPresence({ status: nextOnline ? "ONLINE" : "OFFLINE" }), {
        loadingTitle: "Updating status...",
        loadingMessage: nextOnline ? "Switching to online." : "Switching to offline.",
        successTitle: "Status updated",
        successMessage: nextOnline ? "You are now online." : "You are now offline.",
        errorTitle: "Update failed",
        errorMessage: (err) => err?.message || "Unable to update status.",
      });
      setOnline(nextOnline);
      writeCollectorPresence(nextOnline);
    } catch (e) {
      void e;
    } finally {
      setPresencePending(false);
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-end h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span className={cn("text-xs font-semibold tracking-wide", online ? "text-emerald-700" : "text-slate-600")}>
                {online ? "Online" : "Offline"}
              </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={online}
                  aria-label="Toggle online status"
                  onClick={handleTogglePresence}
                  disabled={presencePending}
                  className={cn(
                    "relative inline-flex h-7 w-12 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60",
                    online ? "bg-emerald-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
                      online ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
            </div>

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
                void logoutAndRedirect({
                  onLoggedOut: () => clearCollectorPresence(),
                });
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
