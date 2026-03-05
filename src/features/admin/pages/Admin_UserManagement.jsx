import { useCallback, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import { Users, UserPlus, Activity, Search, Filter, Download, Eye, Edit2, Key, ChevronLeft, ChevronRight, XCircle, Loader2 } from "lucide-react";
import AdminNavbar from "../components/navigation/AdminNavbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import AdminSidebar from "../components/navigation/Admin_Sidebar.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import { getAdminAccounts } from "../../../services/admin.service.js";
import useNotify from "../../../shared/hooks/useNotify.js";

export default function AdminUserManagement() {
  const notify = useNotify();
  // Filter State
  const [filter, setFilter] = useState({
    search: "",
    role: null, // Changed from "All" to null for API compatibility
    status: null // Changed from "All" to null for API compatibility
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(0);

  // Data State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    newRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // For detail view

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminAccounts();
      if (Array.isArray(data)) {
        // Client-side filtering if backend returns all users
        let filteredData = data;
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredData = filteredData.filter(u => 
            u.fullName?.toLowerCase().includes(searchLower) || 
            u.email?.toLowerCase().includes(searchLower)
          );
        }

        setStats({
          totalUsers: filteredData.length,
          activeToday: filteredData.filter((u) => String(u?.status || "").toLowerCase() === "active").length,
          newRequests: 0,
        });

        // Calculate pagination locally since backend returns list
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        setUsers(filteredData.slice(startIndex, startIndex + itemsPerPage));
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      notify.error("Error", "Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, itemsPerPage, notify]);

  // Fetch Data
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Re-fetch when page or filters change

  const handleStatusToggle = async () => {
    try {
      notify.error("Not supported", "This action is not available in the current API.");
    } catch (error) {
      console.error("Failed to update status:", error);
      notify.error("Error", "Failed to update user status.");
    }
  };

  const handleViewUser = async () => {
    try {
      notify.error("Not supported", "This action is not available in the current API.");
    } catch (error) {
      console.error("Failed to fetch user detail:", error);
      notify.error("Error", "Failed to load user details.");
    }
  };

  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  // Filter Handlers
  const handleSearchChange = (e) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleRoleChange = (e) => {
    const val = e.target.value === "All" ? null : e.target.value;
    setFilter(prev => ({ ...prev, role: val }));
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value === "All" ? null : e.target.value;
    setFilter(prev => ({ ...prev, status: val }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilter({
      search: "",
      role: null,
      status: null
    });
    setCurrentPage(1);
  };

  // Pagination Handlers
  const getRoleBadgeStyle = (roleName) => {
    const role = (roleName || '').toUpperCase();
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CITIZEN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COLLECTOR':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ENTERPRISE':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
             value={stats.totalUsers.toLocaleString()} 
             change="+12%" // Ideally this would come from API too
             icon={<Users className="w-6 h-6" />} 
             color="green" 
           />
           <StatCard 
             title="Active Today" 
             value={stats.activeToday.toLocaleString()} 
             change="+5.2%" 
             icon={<Activity className="w-6 h-6" />} 
             color="blue" 
           />
           <StatCard 
             title="New Requests" 
             value={stats.newRequests.toLocaleString()} 
             change="Awaiting approval" 
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
                  value={filter.role || "All"}
                  onChange={handleRoleChange}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                >
                   <option value="All">Role: All</option>
                   <option value="ADMIN">Admin</option>
                   <option value="CITIZEN">Citizen</option>
                   <option value="COLLECTOR">Collector</option>
                   <option value="ENTERPRISE">Enterprise</option>
                </select>
                <select 
                  value={filter.status || "All"}
                  onChange={handleStatusChange}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                >
                   <option value="All">Status: All</option>
                   <option value="Active">Active</option>
                   <option value="Suspended">Suspended</option>
                </select>
                
                {/* Reset Button */}
                {(filter.search || filter.role !== null || filter.status !== null) && (
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

          <div className="overflow-x-auto min-h-[300px]">
             {loading ? (
               <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                 <Loader2 className="w-8 h-8 animate-spin mb-2 text-green-500" />
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
                   {users.length > 0 ? (
                     users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="py-4 px-6">
                              <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                    {(user.avatar || (user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"))}
                                  </div>
                                  <div>
                                     <div className="font-bold text-gray-900">{user.fullName || "N/A"}</div>
                                     <div className="text-xs text-gray-500">{user.email}</div>
                                  </div>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(user.roleName || user.roleCode)}`}>
                                 {user.roleName || user.roleCode || "N/A"}
                              </span>
                           </td>
                           <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                 (user.status || '').toLowerCase() === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 
                                 (user.status || '').toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                 (user.status || '').toLowerCase() === 'suspended' ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                                 'bg-gray-50 text-gray-500 border-gray-200'
                              }`}>
                                 <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    (user.status || '').toLowerCase() === 'active' ? 'bg-green-500' : 
                                    (user.status || '').toLowerCase() === 'pending' ? 'bg-orange-500' : 
                                    'bg-gray-400'
                                 }`}></span>
                                 {user.status}
                              </span>
                           </td>
                           <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                           </td>
                           <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => handleViewUser(user.id)}
                                   className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                 >
                                    <Eye className="w-4 h-4" />
                                 </button>
                                 <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => handleStatusToggle(user)}
                                   className={`p-2 rounded-lg transition-colors ${
                                     (user.status || '').toLowerCase() === 'active' 
                                       ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                       : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                   }`}
                                   title={(user.status || '').toLowerCase() === 'active' ? 'Suspend User' : 'Activate User'}
                                 >
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
             )}
          </div>

          {/* Pagination Controls */}
          {!loading && users.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
               <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-900">
                    {Math.min(users.length, (currentPage - 1) * itemsPerPage + 1)}
                    -
                    {Math.min(users.length, currentPage * itemsPerPage)}
                  </span> of <span className="font-bold text-gray-900">{users.length}</span> users
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

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button 
                  onClick={handleCloseDetail}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-bold border-4 border-white shadow-sm">
                    {(selectedUser.avatar || (selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : "?"))}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedUser.fullName || "N/A"}</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(selectedUser.roleName || selectedUser.roleCode)}`}>
                        {selectedUser.roleName || selectedUser.roleCode || "N/A"}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        (selectedUser.status || '').toLowerCase() === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 
                        (selectedUser.status || '').toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{selectedUser.phone || "Not provided"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Joined Date</p>
                    <p className="font-medium text-gray-900">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Last Login</p>
                    <p className="font-medium text-gray-900">
                      {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Never logged in"}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    onClick={handleCloseDetail}
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      handleStatusToggle(selectedUser);
                      handleCloseDetail();
                    }}
                    className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors shadow-md ${
                      (selectedUser.status || '').toLowerCase() === 'active' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {(selectedUser.status || '').toLowerCase() === 'active' ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RoleLayout>
  );
}
