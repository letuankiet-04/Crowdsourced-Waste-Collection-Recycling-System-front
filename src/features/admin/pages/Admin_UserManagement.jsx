import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import { Activity, Download, UserPlus, Users } from "lucide-react";
import AdminNavbar from "../components/navigation/AdminNavbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import AdminSidebar from "../components/navigation/Admin_Sidebar.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import { getAdminAccounts } from "../../../services/admin.service.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import PaginationControls from "../../../shared/ui/PaginationControls.jsx";
import AdminUserFilters from "../components/userManagement/AdminUserFilters.jsx";
import AdminUsersTable from "../components/userManagement/AdminUsersTable.jsx";
import AdminUserDetailsModal from "../components/userManagement/AdminUserDetailsModal.jsx";

export default function AdminUserManagement() {
  const notify = useNotify();
  const [filter, setFilter] = useState({
    search: "",
    role: null,
    status: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const data = await getAdminAccounts();
        if (!active) return;
        setAllUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        void error;
        if (!active) return;
        notify.error("Error", "Failed to load users. Please try again.");
        setAllUsers([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [notify]);

  const filteredUsers = useMemo(() => {
    let next = Array.isArray(allUsers) ? allUsers : [];

    const searchLower = String(filter.search || "").trim().toLowerCase();
    if (searchLower) {
      next = next.filter(
        (u) =>
          String(u?.fullName || "").toLowerCase().includes(searchLower) ||
          String(u?.email || "").toLowerCase().includes(searchLower) ||
          String(u?.id || "").toLowerCase().includes(searchLower)
      );
    }

    if (filter.role) {
      const roleUpper = String(filter.role).toUpperCase();
      next = next.filter((u) => String(u?.roleName || u?.roleCode || u?.role || "").toUpperCase() === roleUpper);
    }

    if (filter.status) {
      const statusLower = String(filter.status).toLowerCase();
      next = next.filter((u) => String(u?.status || "").toLowerCase() === statusLower);
    }

    return next;
  }, [allUsers, filter.role, filter.search, filter.status]);

  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / itemsPerPage), [filteredUsers.length, itemsPerPage]);

  useEffect(() => {
    if (!totalPages) return;
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const pagedUsers = useMemo(() => {
    if (!filteredUsers.length) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredUsers, itemsPerPage]);

  const stats = useMemo(
    () => ({
      totalUsers: filteredUsers.length,
      activeToday: filteredUsers.filter((u) => String(u?.status || "").toLowerCase() === "active").length,
      newRequests: 0,
    }),
    [filteredUsers]
  );

  const pageStart = filteredUsers.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const pageEnd = Math.min(filteredUsers.length, currentPage * itemsPerPage);

  const handleStatusToggle = async () => {
    notify.error("Not supported", "This action is not available in the current API.");
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  const handleSearchChange = (e) => {
    setFilter((prev) => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  };

  const handleRoleChange = (e) => {
    const val = e.target.value === "All" ? null : e.target.value;
    setFilter((prev) => ({ ...prev, role: val }));
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value === "All" ? null : e.target.value;
    setFilter((prev) => ({ ...prev, status: val }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilter({
      search: "",
      role: null,
      status: null,
    });
    setCurrentPage(1);
  };
  const handlePageChange = (page) => setCurrentPage(page);

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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(PATHS.admin.createUser.replace(':role', 'citizen'))}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <UserCircle className="w-5 h-5" />
              Create Citizen
            </button>
            <button
              type="button"
              onClick={() => navigate(PATHS.admin.createUser.replace(':role', 'enterprise'))}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Building2 className="w-5 h-5" />
              Create Enterprise
            </button>
            <button
              type="button"
              onClick={() => navigate(PATHS.admin.createUser.replace(':role', 'collector'))}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Truck className="w-5 h-5" />
              Create Collector
            </button>
          </div>
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
            </div>
          </CardHeader>
          <AdminUserFilters
            filter={filter}
            onSearchChange={handleSearchChange}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
            onReset={handleResetFilters}
          />

          <AdminUsersTable
            users={pagedUsers}
            loading={loading}
            onResetFilters={handleResetFilters}
            onViewUser={handleViewUser}
            onStatusToggle={handleStatusToggle}
          />

          {/* Pagination Controls */}
          {!loading && filteredUsers.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
               <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-900">{pageStart}-{pageEnd}</span> of{" "}
                  <span className="font-bold text-gray-900">{filteredUsers.length}</span> users
               </div>
               <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </Card>

        {/* User Detail Modal */}
        <AdminUserDetailsModal
          user={selectedUser}
          onClose={handleCloseDetail}
          onToggleStatus={() => {
            if (!selectedUser) return;
            void handleStatusToggle(selectedUser);
            handleCloseDetail();
          }}
        />

      </div>
    </RoleLayout>
  );
}
