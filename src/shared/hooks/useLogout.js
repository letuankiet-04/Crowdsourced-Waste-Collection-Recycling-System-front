import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../app/routes/paths.js";
import { logout } from "../../services/auth.service.js";
import { updateCollectorPresence } from "../../services/collector.service.js";
import useStoredUser from "./useStoredUser.js";
import { clearCollectorPresence } from "../lib/collectorPresenceStorage.js";

export default function useLogout() {
  const navigate = useNavigate();
  const { user, clearAuth } = useStoredUser();

  return useCallback(
    async ({
      to = PATHS.auth.login,
      replace = true,
      includeCollectorPresence = true,
      onLoggedOut,
    } = {}) => {
      if (includeCollectorPresence && String(user?.role || "").toUpperCase() === "COLLECTOR") {
        try {
          await updateCollectorPresence({ status: "OFFLINE" });
        } catch (err) {
          void err;
        }
      }

      try {
        await logout();
      } catch (err) {
        void err;
      }

      if (String(user?.role || "").toUpperCase() === "COLLECTOR") {
        clearCollectorPresence();
      }
      clearAuth();
      onLoggedOut?.();
      navigate(to, { replace });
    },
    [clearAuth, navigate, user]
  );
}
