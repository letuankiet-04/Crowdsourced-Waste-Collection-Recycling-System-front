import { Filter, Search, XCircle } from "lucide-react";

export default function AdminUserFilters({
  filter,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onReset,
}) {
  const hasActiveFilter = Boolean(filter?.search) || filter?.role != null || filter?.status != null;

  return (
    <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col lg:flex-row gap-4 justify-between items-center">
      <div className="relative w-full lg:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={filter?.search ?? ""}
          onChange={onSearchChange}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
        <select
          value={filter?.role ?? "All"}
          onChange={onRoleChange}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="All">Role: All</option>
          <option value="ADMIN">Admin</option>
          <option value="CITIZEN">Citizen</option>
          <option value="COLLECTOR">Collector</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
        <select
          value={filter?.status ?? "All"}
          onChange={onStatusChange}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="All">Status: All</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>

        {hasActiveFilter ? (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
            type="button"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
