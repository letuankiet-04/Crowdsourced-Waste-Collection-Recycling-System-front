import { memo } from "react";

const UserProfileDetailRow = memo(function UserProfileDetailRow({ label, value, isEditing, name, onChange, type = "text" }) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
      ) : (
        <div className="text-gray-900 font-medium text-base min-h-[24px]">{value}</div>
      )}
    </div>
  );
});

export default UserProfileDetailRow;

