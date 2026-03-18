import { useEffect } from "react";
import RoleSidebar from "../../../shared/layout/sidebar/RoleSidebar.jsx";
import SidebarLogoutButton from "../../../shared/layout/sidebar/SidebarLogoutButton.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import logo from "../../../assets/app-logo.jpg";
import CollectorNavbar from "../components/navigation/CollectorNavbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import { updateCollectorPresence } from "../../../services/collector.service.js";
import { collectorNavItems } from "../components/navigation/CollectorNavItems.jsx";
import resolveApiBaseUrl from "../../../services/http/baseUrl.js";
import { readCollectorPresence, writeCollectorPresence } from "../../../shared/lib/collectorPresenceStorage.js";

export default function CollectorLayout({ children }) {
  const { user } = useStoredUser();

  useEffect(() => {
    if (!user) return;

    const storedPresence = readCollectorPresence();
    if (storedPresence === null) {
      writeCollectorPresence(true);
    }

    if (storedPresence !== false) {
      void (async () => {
        try {
          await updateCollectorPresence({ status: "ONLINE" });
        } catch (e) {
          void e;
        }
      })();
    }

    const baseURL = resolveApiBaseUrl();

    function sendOfflineKeepalive() {
      if (readCollectorPresence() !== true) return;
      const token =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
          : null;
      if (!token) return;
      void fetch(`${baseURL}/api/collector/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "OFFLINE" }),
        keepalive: true,
      }).catch((e) => void e);
    }

    window.addEventListener("pagehide", sendOfflineKeepalive);
    window.addEventListener("beforeunload", sendOfflineKeepalive);
    return () => {
      window.removeEventListener("pagehide", sendOfflineKeepalive);
      window.removeEventListener("beforeunload", sendOfflineKeepalive);
    };
  }, [user]);

  return (
    <RoleLayout
      sidebar={
        <RoleSidebar
          brand={{
            logoSrc: logo,
            logoAlt: "Collector Portal Logo",
            title: "Collector Portal",
          }}
          navItems={collectorNavItems}
          footer={<SidebarLogoutButton />}
        />
      }
      navbar={<CollectorNavbar />}
      showBackgroundEffects={false}
      footer={
        <div className="mt-10">
          <CD_Footer portalName="Collector Portal" />
        </div>
      }
    >
      {children}
    </RoleLayout>
  );
}
