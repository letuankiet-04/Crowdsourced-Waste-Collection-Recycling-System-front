import { memo } from "react";
import { User } from "lucide-react";
import UserProfileDetailRow from "./UserProfileDetailRow.jsx";

const UserProfilePersonalDetailsCard = memo(function UserProfilePersonalDetailsCard({ formData, isEditing, onChange, location }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <User className="text-emerald-500" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
      </div>
      <div className="space-y-8 flex-1">
        <UserProfileDetailRow label="Full Name" value={formData.fullName} isEditing={isEditing} name="fullName" onChange={onChange} />
        <UserProfileDetailRow label="Email Address" value={formData.email} isEditing={false} name="email" onChange={onChange} />
        <UserProfileDetailRow label="Phone Number" value={formData.phone} isEditing={isEditing} name="phone" onChange={onChange} />
        {isEditing ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address Details</div>
            <input
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input name="city" placeholder="City" value={formData.city} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
              <input name="ward" placeholder="Ward" value={formData.ward} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
        ) : (
          <UserProfileDetailRow label="Primary Location" value={location} />
        )}
      </div>
    </div>
  );
});

export default UserProfilePersonalDetailsCard;

