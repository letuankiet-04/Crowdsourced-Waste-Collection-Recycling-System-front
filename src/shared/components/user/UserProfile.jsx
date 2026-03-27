import { useEffect, useMemo, useRef, useState } from "react";
import useStoredUser from "../../hooks/useStoredUser.js";
import { cn } from "../../lib/cn.js";
import { getMyProfileByRole, updateProfile } from "../../../services/auth.service.js";
import UserProfileHeader from "./UserProfileHeader.jsx";
import UserProfilePersonalDetailsCard from "./UserProfilePersonalDetailsCard.jsx";
import UserProfileSecuritySettingsCard from "./UserProfileSecuritySettingsCard.jsx";

export default function UserProfile({ user: propUser, className }) {
  const { user: storedUser } = useStoredUser();
  const user = propUser || storedUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [formData, setFormData] = useState({});
  const hydrateRef = useRef("");
  const roleNormalized = String(user?.role ?? user?.roleCode ?? "").toLowerCase();
  const canEditProfile = roleNormalized === "citizen" || roleNormalized === "enterprise";

  useEffect(() => {
    if (user) {
        setFormData({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            city: user.city || "",
            ward: user.ward || ""
        });
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProfile() {
      if (!user) return;
      if (isEditing) return;

      const roleNormalized = String(user.role ?? user.roleCode ?? "").toLowerCase();
      if (roleNormalized !== "citizen" && roleNormalized !== "enterprise") return;

      const keyBase = String(user.email ?? user.id ?? user.citizenId ?? user.enterpriseId ?? "");
      const hydrateKey = `${roleNormalized}:${keyBase}`;
      if (hydrateRef.current === hydrateKey) return;
      hydrateRef.current = hydrateKey;

      const missingAddress =
        !user.address || (roleNormalized === "citizen" && (!user.city || !user.ward));
      const missingPhone = !user.phone;
      if (!missingAddress && !missingPhone) return;

      try {
        const profile = await getMyProfileByRole(roleNormalized);
        if (cancelled || !profile) return;

        setFormData((prev) => {
          const next = { ...prev };
          if (typeof profile.phone === "string" && profile.phone.trim() && !String(prev.phone ?? "").trim()) next.phone = profile.phone;
          if (typeof profile.address === "string" && profile.address.trim() && !String(prev.address ?? "").trim()) next.address = profile.address;
          if (roleNormalized === "citizen") {
            if (typeof profile.city === "string" && profile.city.trim() && !String(prev.city ?? "").trim()) next.city = profile.city;
            if (typeof profile.ward === "string" && profile.ward.trim() && !String(prev.ward ?? "").trim()) next.ward = profile.ward;
          }
          return next;
        });

        const mergedUser = { ...user, ...profile };
        const serialized = JSON.stringify(mergedUser);
        const storedSession = window.sessionStorage.getItem("user");
        const storedLocal = window.localStorage.getItem("user");
        if (storedSession) window.sessionStorage.setItem("user", serialized);
        if (storedLocal) window.localStorage.setItem("user", serialized);

        try {
          window.dispatchEvent(new StorageEvent("storage", { key: "user", newValue: serialized }));
        } catch {
          window.dispatchEvent(new Event("storage"));
        }
      } catch {
        return;
      }
    }

    hydrateProfile();
    return () => {
      cancelled = true;
    };
  }, [user, isEditing]);

  const role = useMemo(() => (user?.role || user?.roleCode || "User").toUpperCase(), [user?.role, user?.roleCode]);
  const enterpriseId = useMemo(() => user?.enterpriseId ?? user?.enterprise_id ?? null, [user?.enterpriseId, user?.enterprise_id]);
  const enterpriseName = useMemo(() => user?.enterpriseName ?? user?.enterprise_name ?? null, [user?.enterpriseName, user?.enterprise_name]);
  const location = useMemo(() => {
    const address = typeof formData.address === "string" ? formData.address.trim() : "";
    const ward = typeof formData.ward === "string" ? formData.ward.trim() : "";
    const city = typeof formData.city === "string" ? formData.city.trim() : "";

    const parts = [address, ward, city].filter(Boolean);
    if (parts.length) return parts.join(", ");
    return "Location not set";
  }, [formData.address, formData.city, formData.ward]);
  const status = useMemo(() => {
    if (!user?.status) return "Active";
    return user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase();
  }, [user?.status]);
  const isVerified = useMemo(() => status.toLowerCase() === 'active', [status]);

  if (!user) {
      return (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 italic">
              Loading user profile...
          </div>
      );
  }

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
      if (!canEditProfile) {
          alert("Profile editing is not supported for this account.");
          return;
      }
      setPending(true);
      try {
          const updatedUser = await updateProfile({ ...user, ...formData });
          const mergedUser = { ...user, ...updatedUser, ...formData };
          const serialized = JSON.stringify(mergedUser);
          const hasLocalToken = Boolean(window.localStorage.getItem("token"));
          const targetStorage = hasLocalToken ? window.localStorage : window.sessionStorage;
          const otherStorage = hasLocalToken ? window.sessionStorage : window.localStorage;
          targetStorage.setItem("user", serialized);
          otherStorage.removeItem("user");

          try {
            window.dispatchEvent(new StorageEvent("storage", { key: "user", newValue: serialized }));
          } catch {
            window.dispatchEvent(new Event("storage"));
          }
          
          setFormData({
            fullName: mergedUser.fullName || "",
            email: mergedUser.email || "",
            phone: mergedUser.phone || "",
            address: mergedUser.address || "",
            city: mergedUser.city || "",
            ward: mergedUser.ward || "",
          });
          setIsEditing(false);
      } catch (error) {
          console.error("Failed to update profile", error);
          alert("Failed to update profile. Please try again.");
      } finally {
          setPending(false);
      }
  };

  const handleCancel = () => {
      // Revert to original user data
      setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          ward: user.ward || ""
      });
      setIsEditing(false);
  };
  return (
    <div className={cn("space-y-6", className)}>
      <UserProfileHeader
        fullName={formData.fullName || user.fullName}
        role={role}
        location={location}
        avatarUrl={user.avatarUrl}
        isEditing={isEditing}
        pending={pending}
        onEdit={() => {
          if (!canEditProfile) {
            alert("Profile editing is not supported for this account.");
            return;
          }
          setIsEditing(true);
        }}
        onCancel={handleCancel}
        onSave={handleSave}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserProfilePersonalDetailsCard
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
          location={location}
          isVerified={isVerified}
          status={status}
          enterpriseId={enterpriseId}
          enterpriseName={enterpriseName}
        />
        <UserProfileSecuritySettingsCard />
      </div>
    </div>
  );
}
