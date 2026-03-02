import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import { Users, UserPlus, Activity, Search, Filter, Download, Eye, Edit2, Key, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import AdminNavbar from "./dashboard_comp/AdminNavbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import AdminSidebar from "./dashboard_comp/Admin_Sidebar.jsx";
import StatCard from "./dashboard_comp/StatCard.jsx";
import { getAdminAccounts } from "../../../services/admin.service.js";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadError("");
      try {
        const data = await getAdminAccounts();
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((u) => {
          const fullName = typeof u?.fullName === "string" && u.fullName.trim() ? u.fullName.trim() : null;
          const email = typeof u?.email === "string" ? u.email : "";
          const name = fullName || email || "User";
          const roleCode = typeof u?.roleCode === "string" ? u.roleCode : "";
          const roleDisplay = roleCode ? roleCode.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "User";
          const statusRaw = typeof u?.status === "string" ? u.status : "";
          const status = statusRaw ? statusRaw.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "Active";
          const createdAt = u?.createdAt ? new Date(u.createdAt) : null;
          const joined =
            createdAt && !Number.isNaN(createdAt.getTime())
              ? createdAt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
              : "-";
          const avatar = name ? String(name).trim().slice(0, 1).toUpperCase() : "?";
          return { id: u?.id, name, email, role: roleDisplay, status, joined, avatar };
        });
        setUsers(mapped);
      } catch (e) {
        if (!active) return;
        setUsers([]);
        setLoadError(e?.message || "Unable to load users.");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Filter State
  const [filter, setFilter] = useState({
    search: "",
    role: "All",
    status: "All"
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter Handlers
  const handleSearchChange = (e) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleRoleChange = (e) => {
    setFilter(prev => ({ ...prev, role: e.target.value }));
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setFilter(prev => ({ ...prev, status: e.target.value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilter({
      search: "",
      role: "All",
      status: "All"
    });
    setCurrentPage(1);
  };

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search Logic (Name or Email)
      const searchTerm = filter.search.toLowerCase().trim();
      const matchesSearch = 
        String(user.id ?? "").toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm);

      // Role Logic
      const matchesRole = filter.role === "All" || user.role === filter.role;

      // Status Logic
      const matchesStatus = filter.status === "All" || user.status === filter.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [filter, users]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination Handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <RoleLayout
      sidebar={<AdminSidebar />}
      navbar={<AdminNavbar />}
      footer={
        <div className="animate-fade-in-up">
          <CD_Footer />
        </div>
      }
    >
      <div className="max-w-screen-xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
          <div>
            <div className="text-sm text-gray-500 font-medium mb-1">Admin / User Management</div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95">
             <UserPlus className="w-5 h-5" />
             Invite User
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
           <StatCard 
             title="Total Users" 
             value={String(users.length)} 
             change="" 
             icon={<Users className="w-6 h-6" />} 
             color="green" 
           />
           <StatCard 
             title="Active Today" 
             value={String(users.filter((u) => String(u.status).toLowerCase() === "active").length)} 
             change="" 
             icon={<Activity className="w-6 h-6" />} 
             color="blue" 
           />
           <StatCard 
             title="Suspended" 
             value={String(users.filter((u) => String(u.status).toLowerCase() === "suspended").length)} 
             change="" 
             icon={<UserPlus className="w-6 h-6" />} 
             color="orange" 
           />
        </div>

        {/* User Directory Table Card */}
        <Card className="animate-fade-in-up">
          <CardHeader className="py-6 px-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">User Directory</CardTitle>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                 <Download className="w-4 h-4" />
                 Export
               </button>
               <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                 <Filter className="w-4 h-4" />
                 Columns
               </button>
            </div>
          </CardHeader>
          
          <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col lg:flex-row gap-4 justify-between items-center">
             <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or ID..." 
                  value={filter.search}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
             </div>
             <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
                <select 
                  value={filter.role}
                  onChange={handleRoleChange}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                >
                   <option value="All">Role: All</option>
                   <option value="Admin">Admin</option>
                   <option value="Citizen">Citizen</option>
                   <option value="Collector">Collector</option>
                   <option value="Enterprise">Enterprise</option>
                </select>
                <select 
                  value={filter.status}
                  onChange={handleStatusChange}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                >
                   <option value="All">Status: All</option>
                   <option value="Active">Active</option>
                   <option value="Suspended">Suspended</option>
                </select>
                
                {/* Reset Button */}
                {(filter.search || filter.role !== "All" || filter.status !== "All") && (
                  <button 
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                  >
                    <XCircle className="w-4 h-4" />
                    Reset
                  </button>
                )}
             </div>
          </div>

          <div className="overflow-x-auto">
             {loadError ? (
               <div className="p-6 text-sm text-red-600">{loadError}</div>
             ) : null}
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
                   {paginatedUsers.length > 0 ? (
                     paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="py-4 px-6">
                              <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                    {user.avatar}
                                  </div>
                                  <div>
                                     <div className="font-bold text-gray-900">{user.name}</div>
                                     <div className="text-xs text-gray-500">{user.email}</div>
                                  </div>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                 {user.role}
                              </span>
                           </td>
                           <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                 user.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 
                                 user.status === 'Pending' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                 user.status === 'Suspended' ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                                 'bg-gray-50 text-gray-500 border-gray-200'
                              }`}>
                                 <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    user.status === 'Active' ? 'bg-green-500' : 
                                    user.status === 'Pending' ? 'bg-orange-500' : 
                                    'bg-gray-400'
                                 }`}></span>
                                 {user.status}
                              </span>
                           </td>
                           <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                              {user.joined}
                           </td>
                           <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Eye className="w-4 h-4" />
                                 </button>
                                 <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                    <Key className="w-4 h-4" />
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
                                 <Search className="w-6 h-6 text-gray-400" />
                              </div>
                              <p className="font-medium">No users found matching your filters.</p>
                              <button 
                                onClick={handleResetFilters}
                                className="text-sm text-green-600 font-bold hover:underline"
                              >
                                Clear all filters
                              </button>
                           </div>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
               <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-900">
                    {Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)}
                    -
                    {Math.min(filteredUsers.length, currentPage * itemsPerPage)}
                  </span> of <span className="font-bold text-gray-900">{filteredUsers.length}</span> users
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                     <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium transition-all ${
                          currentPage === page
                            ? "bg-green-500 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                     <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          )}
        </Card>

      </div>
    </RoleLayout>
  );
}
