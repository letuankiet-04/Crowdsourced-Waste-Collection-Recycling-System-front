import { memo } from "react";
import { Edit, Loader2, MapPin, MessageSquare, Save, User, X } from "lucide-react";

const UserProfileHeader = memo(function UserProfileHeader({ fullName, role, location, avatarUrl, isEditing, pending, onEdit, onCancel, onSave }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
      <div className="relative flex-shrink-0">
        <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : <User size={64} className="text-orange-400" />}
        </div>
      </div>
      <div className="flex-1 text-center md:text-left space-y-2 mt-2">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
          <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
          <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold tracking-widest uppercase border border-gray-200">{role}</span>
        </div>
        <div className="flex items-center justify-center md:justify-start text-gray-500 gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span>{location}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 md:mt-2 w-full md:w-auto justify-center">
        {isEditing ? (
          <>
            <button
              onClick={onCancel}
              disabled={pending}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm"
              type="button"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={pending}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 text-sm disabled:opacity-70"
              type="button"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm"
              type="button"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 text-sm"
              type="button"
            >
              <MessageSquare size={16} />
              Contact
            </button>
          </>
        )}
      </div>
    </div>
  );
});

export default UserProfileHeader;

