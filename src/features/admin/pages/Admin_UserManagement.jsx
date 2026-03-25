import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import { Activity, AlertCircle, Download, Users } from "lucide-react";
import AdminNavbar from "../components/navigation/AdminNavbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import AdminSidebar from "../components/navigation/Admin_Sidebar.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import {
  activateAdminAccount,
  getAdminAccountById,
  getAdminAccounts,
  suspendAdminAccount,
  updateAdminAccount,
} from "../../../services/admin.service.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import PaginationControls from "../../../shared/ui/PaginationControls.jsx";
import AdminUserFilters from "../components/userManagement/AdminUserFilters.jsx";
import AdminUsersTable from "../components/userManagement/AdminUsersTable.jsx";
import AdminUserDetailsModal from "../components/userManagement/AdminUserDetailsModal.jsx";
import CreateCitizenDialog from "../components/userManagement/CreateCitizenDialog.jsx";
import CreateCollectorDialog from "../components/userManagement/CreateCollectorDialog.jsx";
import CreateEnterpriseDialog from "../components/userManagement/CreateEnterpriseDialog.jsx";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog.jsx";
import { getPendingAdminFeedbackCount } from "../../../services/feedback.service.js";

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
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
  const [pendingFeedbackLoading, setPendingFeedbackLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editDraft, setEditDraft] = useState({ email: "", fullName: "", phone: "" });
  const [confirmSuspendOpen, setConfirmSuspendOpen] = useState(false);
  const [confirmSuspendUser, setConfirmSuspendUser] = useState(null);
  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);
  const [confirmActivateUser, setConfirmActivateUser] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [createCitizenOpen, setCreateCitizenOpen] = useState(false);
  const [createCollectorOpen, setCreateCollectorOpen] = useState(false);
  const [createEnterpriseOpen, setCreateEnterpriseOpen] = useState(false);

  const listParams = useMemo(() => {
    const params = {};
    if (filter.role) params.role = String(filter.role).toUpperCase();
    if (filter.status) params.status = String(filter.status).toLowerCase();
    return Object.keys(params).length ? params : undefined;
  }, [filter.role, filter.status]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const data = await getAdminAccounts(listParams);
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
  }, [listParams, notify]);

  useEffect(() => {
    let active = true;
    setPendingFeedbackLoading(true);
    void (async () => {
      try {
        const count = await getPendingAdminFeedbackCount();
        if (!active) return;
        setPendingFeedbackCount(count);
      } catch {
        if (!active) return;
        setPendingFeedbackCount(0);
      } finally {
        if (active) setPendingFeedbackLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
    }),
    [filteredUsers]
  );

  const refreshUsers = async () => {
    const data = await getAdminAccounts(listParams);
    setAllUsers(Array.isArray(data) ? data : []);
  };

  const handleStatusToggle = async (user) => {
    const userId = user?.id;
    if (!userId) return;
    const isActive = String(user?.status || "").toLowerCase() === "active";
    const nextStatus = isActive ? "suspended" : "active";
    try {
      const result = await notify.promise(isActive ? suspendAdminAccount(userId) : activateAdminAccount(userId), {
        loadingTitle: isActive ? "Suspending user" : "Activating user",
        successTitle: "Success",
        successMessage: isActive ? "User suspended." : "User activated.",
        errorTitle: "Error",
      });
      const patch = result && typeof result === "object" ? result : {};
      const normalizedPatch = "status" in patch ? patch : { ...patch, status: nextStatus };
      setAllUsers((prev) =>
        Array.isArray(prev) ? prev.map((u) => (u?.id === userId ? { ...u, ...normalizedPatch } : u)) : prev
      );
      setSelectedUser((prev) => (prev?.id === userId ? { ...prev, ...normalizedPatch } : prev));
      return true;
    } catch {
      return false;
    }
  };

  const requestStatusToggle = (user) => {
    const isActive = String(user?.status || "").toLowerCase() === "active";
    if (isActive) {
      setConfirmSuspendUser(user);
      setConfirmSuspendOpen(true);
      return;
    }
    setConfirmActivateUser(user);
    setConfirmActivateOpen(true);
  };

  const openEditUser = async (user) => {
    setEditError("");
    setEditUser(user);
    setEditDraft({
      email: String(user?.email || ""),
      fullName: String(user?.fullName || ""),
      phone: String(user?.phone || ""),
    });
    setEditOpen(true);

    const userId = user?.id;
    if (!userId) return;
    try {
      const full = await getAdminAccountById(userId);
      const resolved = full || user;
      setEditUser(resolved);
      setEditDraft({
        email: String(resolved?.email || ""),
        fullName: String(resolved?.fullName || ""),
        phone: String(resolved?.phone || ""),
      });
    } catch {
      return;
    }
  };

  const closeEdit = (force = false) => {
    if (editSubmitting && !force) return;
    setEditOpen(false);
    setEditError("");
    setEditSubmitting(false);
    setEditUser(null);
    setEditDraft({ email: "", fullName: "", phone: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editSubmitting) return;
    const userId = editUser?.id;
    if (!userId) return;

    const payload = {
      email: String(editDraft.email || "").trim(),
      fullName: String(editDraft.fullName || "").trim(),
      phone: String(editDraft.phone || "").trim(),
    };

    if (!payload.email || !payload.fullName) {
      setEditError("Please fill in Email and Full name.");
      return;
    }

    setEditError("");
    setEditSubmitting(true);
    try {
      const updated = await notify.promise(updateAdminAccount(userId, payload), {
        loadingTitle: "Updating user",
        successTitle: "Success",
        successMessage: "User updated.",
        errorTitle: "Error",
      });
      const patch = updated && typeof updated === "object" ? updated : payload;
      setAllUsers((prev) => (Array.isArray(prev) ? prev.map((u) => (u?.id === userId ? { ...u, ...patch } : u)) : prev));
      setSelectedUser((prev) => (prev?.id === userId ? { ...prev, ...patch } : prev));
      closeEdit(true);
    } catch (err) {
      const status = err?.status;
      if (status === 401 || status === 403) {
        setEditError("You are not authorized to perform this action.");
      } else if (status === 404 || status === 405) {
        setEditError("The backend does not support updating users (PATCH /api/admin/accounts/{id}).");
      } else if (typeof status === "number" && status >= 500) {
        setEditError("Server error while updating the user. Please check PATCH /api/admin/accounts/{id}.");
      } else {
        setEditError(err?.message || "Unable to update user.");
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    const userId = user?.id;
    if (!userId) return;
    try {
      const full = await getAdminAccountById(userId);
      setSelectedUser(full || user);
    } catch {
      return;
    }
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
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              type="button"
              onClick={() => setCreateCitizenOpen(true)}
            >
              Create Citizen
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              type="button"
              onClick={() => setCreateCollectorOpen(true)}
            >
              Create Collector
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              type="button"
              onClick={() => setCreateEnterpriseOpen(true)}
            >
              Create Enterprise
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
             title="Pending Feedback" 
             value={pendingFeedbackLoading ? "Wait API" : pendingFeedbackCount.toLocaleString()} 
             change="Requires review" 
             icon={<AlertCircle className="w-6 h-6" />} 
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
            onEditUser={openEditUser}
            onStatusToggle={requestStatusToggle}
          />

          {/* Pagination Controls */}
          {!loading && filteredUsers.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-center">
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
            requestStatusToggle(selectedUser);
          }}
        />

        <ConfirmDialog
          open={confirmSuspendOpen}
          title="Suspend account?"
          description="This will mark the account as suspended and prevent the user from accessing the system. Are you sure you want to suspend this account?"
          confirmText="Suspend"
          cancelText="Cancel"
          confirmDisabled={statusSubmitting}
          confirmClassName="bg-red-600 hover:bg-red-700"
          onClose={() => {
            if (statusSubmitting) return;
            setConfirmSuspendOpen(false);
            setConfirmSuspendUser(null);
          }}
          onConfirm={async () => {
            if (!confirmSuspendUser) return;
            if (statusSubmitting) return;
            setStatusSubmitting(true);
            const ok = await handleStatusToggle(confirmSuspendUser);
            setStatusSubmitting(false);
            if (!ok) return;
            setConfirmSuspendOpen(false);
            setConfirmSuspendUser(null);
          }}
        />

        <ConfirmDialog
          open={confirmActivateOpen}
          title="Activate account?"
          description="This will mark the account as active and allow the user to access the system. Are you sure you want to activate this account?"
          confirmText="Activate"
          cancelText="Cancel"
          confirmDisabled={statusSubmitting}
          confirmClassName="bg-green-600 hover:bg-green-700"
          onClose={() => {
            if (statusSubmitting) return;
            setConfirmActivateOpen(false);
            setConfirmActivateUser(null);
          }}
          onConfirm={async () => {
            if (!confirmActivateUser) return;
            if (statusSubmitting) return;
            setStatusSubmitting(true);
            const ok = await handleStatusToggle(confirmActivateUser);
            setStatusSubmitting(false);
            if (!ok) return;
            setConfirmActivateOpen(false);
            setConfirmActivateUser(null);
          }}
        />

        {editOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                <button
                  onClick={() => closeEdit()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  type="button"
                  disabled={editSubmitting}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                {editError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {editError}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">User ID</p>
                    <p className="font-medium text-gray-900">{editUser?.id ?? "N/A"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Joined Date</p>
                    <p className="font-medium text-gray-900">
                      {editUser?.createdAt ? new Date(editUser.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Role</p>
                    <p className="font-medium text-gray-900">{editUser?.roleName || editUser?.roleCode || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Status</p>
                    <p className="font-medium text-gray-900">{editUser?.status || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                    <input
                      value={editDraft.email}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                      type="email"
                      disabled={editSubmitting}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full name</label>
                    <input
                      value={editDraft.fullName}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                      disabled={editSubmitting}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone</label>
                    <input
                      value={editDraft.phone}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                      disabled={editSubmitting}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => closeEdit()}
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    disabled={editSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors shadow-md bg-green-500 hover:bg-green-600 disabled:opacity-60"
                    disabled={editSubmitting}
                  >
                    {editSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <CreateCitizenDialog
          open={createCitizenOpen}
          onClose={() => setCreateCitizenOpen(false)}
          onCreated={async () => {
            setCurrentPage(1);
            await refreshUsers();
          }}
        />
        <CreateCollectorDialog
          open={createCollectorOpen}
          onClose={() => setCreateCollectorOpen(false)}
          onCreated={async () => {
            setCurrentPage(1);
            await refreshUsers();
          }}
        />
        <CreateEnterpriseDialog
          open={createEnterpriseOpen}
          onClose={() => setCreateEnterpriseOpen(false)}
          onCreated={async () => {
            setCurrentPage(1);
            await refreshUsers();
          }}
        />

      </div>
    </RoleLayout>
  );
}
