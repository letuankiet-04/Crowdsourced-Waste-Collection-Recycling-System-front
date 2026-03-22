import useStoredUser from "../../../../shared/hooks/useStoredUser.js";
import { PATHS } from "../../../../app/routes/paths.js";
import UserMenu from "../../../../shared/ui/UserMenu.jsx";
import useLogout from "../../../../shared/hooks/useLogout.js";

export default function EnterpriseNavbar() {
  const { displayName, roleLabel } = useStoredUser();
  const logoutAndRedirect = useLogout();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-end h-20">
          <div className="flex items-center gap-4">
            <UserMenu
              displayName={displayName}
              roleLabel={roleLabel}
              links={[
                { to: PATHS.enterprise.profile, label: "Profile" },
              ]}
              onLogout={() => {
                void logoutAndRedirect();
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
