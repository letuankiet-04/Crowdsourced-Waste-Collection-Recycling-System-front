import { useEffect, useMemo, useState } from "react";
import useStoredUser from "../../hooks/useStoredUser.js";
import { cn } from "../../lib/cn.js";
import { updateProfile } from "../../../services/auth.service.js";
import UserProfileHeader from "./UserProfileHeader.jsx";
import UserProfilePersonalDetailsCard from "./UserProfilePersonalDetailsCard.jsx";
import UserProfileSecuritySettingsCard from "./UserProfileSecuritySettingsCard.jsx";
import UserProfileSystemInfoCard from "./UserProfileSystemInfoCard.jsx";
import { formatDate, formatDateTime } from "./userProfile.utils.js";

export default function UserProfile({ user: propUser, className }) {
  const { user: storedUser } = useStoredUser();
  const user = propUser || storedUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [formData, setFormData] = useState({});

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

  const role = useMemo(() => (user?.role || user?.roleCode || "User").toUpperCase(), [user?.role, user?.roleCode]);
  const enterpriseId = useMemo(() => user?.enterpriseId ?? user?.enterprise_id ?? null, [user?.enterpriseId, user?.enterprise_id]);
  const enterpriseName = useMemo(() => user?.enterpriseName ?? user?.enterprise_name ?? null, [user?.enterpriseName, user?.enterprise_name]);
  const location = useMemo(() => {
    if (formData.address) return formData.city ? `${formData.address}, ${formData.city}` : formData.address;
    if (formData.city) return formData.city;
    if (formData.ward) return `${formData.ward}`;
    return "Location not set";
  }, [formData.address, formData.city, formData.ward]);
  const status = useMemo(() => {
    if (!user?.status) return "Active";
    return user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase();
  }, [user?.status]);
  const isVerified = useMemo(() => status.toLowerCase() === 'active', [status]);
  const createdAt = useMemo(() => formatDate(user?.createdAt), [user?.createdAt]);
  const lastLogin = useMemo(() => formatDateTime(user?.lastLogin), [user?.lastLogin]);
  const membership = useMemo(() => {
    const totalPoints = user?.totalPoints;
    if (totalPoints) {
      if (totalPoints > 5000) return "Platinum Guardian";
      if (totalPoints > 1000) return "Gold Tier Guardian";
      return "Silver Collector";
    }
    if (role.includes("ADMIN")) return "System Administrator";
    if (role.includes("ENTERPRISE")) return "Enterprise Partner";
    return "Standard Member";
  }, [user?.totalPoints, role]);

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
      setPending(true);
      try {
          // 1. Call API to update profile
          const updatedUser = await updateProfile({ ...user, ...formData });
          
          // 2. Update Session Storage
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          
          // 3. Force re-render (or trigger storage event) - simple reload for now or rely on hook if it listened to storage
          window.dispatchEvent(new Event("storage"));
          
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
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserProfilePersonalDetailsCard
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
          location={location}
        />
        <UserProfileSystemInfoCard
          isVerified={isVerified}
          status={status}
          enterpriseId={enterpriseId}
          enterpriseName={enterpriseName}
          membership={membership}
          createdAt={createdAt}
          lastLogin={lastLogin}
        />
      </div>
      <UserProfileSecuritySettingsCard />
    </div>
  );
}
