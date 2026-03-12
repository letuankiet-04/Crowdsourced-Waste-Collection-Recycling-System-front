import { XCircle } from "lucide-react";
import getRoleBadgeStyle from "./getRoleBadgeStyle.js";

function getStatusBadgeClassName(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "bg-green-100 text-green-700 border-green-200";
  if (s === "pending") return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export default function AdminUserDetailsModal({ user, onClose, onToggleStatus }) {
  if (!user) return null;
  const isActive = String(user.status || "").toLowerCase() === "active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">User Details</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" type="button">
            <XCircle className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-bold border-4 border-white shadow-sm">
              {user.avatar || (user.fullName ? user.fullName.charAt(0).toUpperCase() : "?")}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.fullName || "N/A"}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(user.roleName || user.roleCode)}`}>
                  {user.roleName || user.roleCode || "N/A"}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClassName(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Phone</p>
              <p className="font-medium text-gray-900">{user.phone || "Not provided"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Joined Date</p>
              <p className="font-medium text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Last Login</p>
              <p className="font-medium text-gray-900">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never logged in"}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors" type="button">
              Close
            </button>
            {onToggleStatus ? (
              <button
                onClick={onToggleStatus}
                className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors shadow-md ${
                  isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                }`}
                type="button"
              >
                {isActive ? "Suspend Account" : "Activate Account"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
