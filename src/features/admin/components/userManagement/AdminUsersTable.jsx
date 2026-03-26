import { Edit2, Eye, Key, Loader2, Search, Trash2 } from "lucide-react";
import getRoleBadgeStyle from "./getRoleBadgeStyle.js";

function getStatusBadgeClassName(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "bg-green-100 text-green-700 border-green-200";
  if (s === "pending") return "bg-orange-100 text-orange-700 border-orange-200";
  if (s === "suspended") return "bg-red-100 text-red-700 border-red-200";
  return "bg-gray-50 text-gray-500 border-gray-200";
}

function getStatusDotClassName(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "bg-green-500";
  if (s === "pending") return "bg-orange-500";
  if (s === "suspended") return "bg-red-500";
  return "bg-gray-400";
}

export default function AdminUsersTable({ users, loading, onResetFilters, onViewUser, onEditUser, onStatusToggle, onDeleteUser }) {
  return (
    <div className="overflow-x-auto min-h-[300px]">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-green-500" aria-hidden="true" />
          <p>Loading users...</p>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-4 px-6 w-12">
                <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
              </th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.length ? (
              users.map((user) => (
                <tr key={user.id ?? user.email} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        {user.avatar || (user.fullName ? user.fullName.charAt(0).toUpperCase() : "?")}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.fullName || "N/A"}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(
                        user.roleName || user.roleCode
                      )}`}
                    >
                      {user.roleName || user.roleCode || "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClassName(
                        user.status
                      )}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotClassName(user.status)}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onViewUser?.(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        type="button"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => onEditUser?.(user)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        type="button"
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => onStatusToggle?.(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          String(user.status || "").toLowerCase() === "active"
                            ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        title={String(user.status || "").toLowerCase() === "active" ? "Suspend User" : "Activate User"}
                        type="button"
                      >
                        <Key className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => onDeleteUser?.(user)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <p className="font-medium">No users found matching your filters.</p>
                    <button onClick={onResetFilters} className="text-sm text-green-600 font-bold hover:underline" type="button">
                      Clear all filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

