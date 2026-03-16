import { useEffect, useMemo, useState } from "react";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import ValidationError from "../../../shared/ui/ValidationError.jsx";
import {
  createEnterpriseVoucher,
  deleteEnterpriseVoucher,
  getEnterpriseVoucherById,
  getEnterpriseVouchers,
  updateEnterpriseVoucher,
} from "../../../services/voucher.service.js";
import CreateVoucherDialog from "../components/rewards/CreateVoucherDialog.jsx";
import EditVoucherDialog from "../components/rewards/EditVoucherDialog.jsx";
import VoucherDetailDialog from "../components/rewards/VoucherDetailDialog.jsx";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog.jsx";

function formatDateOnly(value) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return String(value);
  }
}

export default function EnterpriseRewards() {
  const notify = useNotify();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedVoucherLoading, setSelectedVoucherLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getEnterpriseVouchers(activeOnly ? { active: true } : undefined)
      .then((rows) => {
        if (cancelled) return;
        setVouchers(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Unable to load vouchers.";
        setError(message);
        notify.error("Load vouchers failed", message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeOnly, notify]);

  const totalCount = vouchers.length;
  const activeCount = useMemo(() => vouchers.filter((v) => v?.active).length, [vouchers]);

  const refreshVouchers = async () => {
    const rows = await getEnterpriseVouchers(activeOnly ? { active: true } : undefined);
    setVouchers(Array.isArray(rows) ? rows : []);
  };

  const openVoucherDetail = async (voucher) => {
    const voucherId = voucher?.id;
    if (!voucherId) return;
    setSelectedVoucher(voucher);
    setSelectedVoucherLoading(true);
    setDetailOpen(true);
    try {
      const full = await getEnterpriseVoucherById(voucherId);
      setSelectedVoucher(full || voucher);
    } catch (err) {
      notify.error("Load voucher failed", err?.message || "Unable to load voucher.");
      setDetailOpen(false);
    } finally {
      setSelectedVoucherLoading(false);
    }
  };

  const openVoucherEdit = async (voucher) => {
    const voucherId = voucher?.id;
    if (!voucherId) return;
    setSelectedVoucher(voucher);
    setSelectedVoucherLoading(true);
    setEditOpen(true);
    try {
      const full = await getEnterpriseVoucherById(voucherId);
      setSelectedVoucher(full || voucher);
    } catch (err) {
      notify.error("Load voucher failed", err?.message || "Unable to load voucher.");
      setEditOpen(false);
    } finally {
      setSelectedVoucherLoading(false);
    }
  };

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Rewards" description="Reward rules, points, and incentives." />
        <Card>
          <CardHeader className="py-6 px-8">
            <div>
              <CardTitle className="text-2xl">Vouchers</CardTitle>
              <div className="mt-1 text-sm text-gray-600">
                {activeOnly ? (
                  <>
                    Showing active vouchers: <span className="font-semibold text-gray-900">{activeCount}</span>
                  </>
                ) : (
                  <>
                    Showing all vouchers: <span className="font-semibold text-gray-900">{totalCount}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  if (loading) return;
                  setLoading(true);
                  setError("");
                  setActiveOnly((v) => !v);
                }}
                disabled={loading}
              >
                {activeOnly ? "Show all" : "Show active only"}
              </Button>
              <Button size="sm" className="rounded-full" onClick={() => setCreateOpen(true)}>
                + Create voucher
              </Button>
            </div>
          </CardHeader>

          <CardBody className="p-0">
            <div className="px-8 pt-6">
              <ValidationError message={error} />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50/60">
                  <tr className="text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-8 py-4 font-bold">Code</th>
                    <th className="px-8 py-4 font-bold">Title</th>
                    <th className="px-8 py-4 font-bold">Value</th>
                    <th className="px-8 py-4 font-bold">Points</th>
                    <th className="px-8 py-4 font-bold">Valid Until</th>
                    <th className="px-8 py-4 font-bold">Stock</th>
                    <th className="px-8 py-4 font-bold text-right">Status</th>
                    <th className="px-8 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={8}>
                        Loading vouchers...
                      </td>
                    </tr>
                  ) : vouchers.length ? (
                    vouchers.map((v) => (
                      <tr key={v?.id ?? v?.voucherCode} className="hover:bg-gray-50/50">
                        <td className="px-8 py-5 text-sm font-semibold text-gray-900">{v?.voucherCode || "-"}</td>
                        <td className="px-8 py-5 text-sm text-gray-900">
                          <div className="flex items-center gap-3">
                            {v?.logoUrl ? (
                              <img alt="logo" src={v.logoUrl} className="h-8 w-8 rounded-lg object-cover border border-gray-100" />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-gray-100 border border-gray-100" />
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{v?.title || "-"}</div>
                              <div className="text-xs text-gray-500 truncate">#{v?.id ?? "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-700">{v?.valueDisplay || "-"}</td>
                        <td className="px-8 py-5 text-sm text-gray-700">{v?.pointsRequired ?? "-"}</td>
                        <td className="px-8 py-5 text-sm text-gray-700">{formatDateOnly(v?.validUntil)}</td>
                        <td className="px-8 py-5 text-sm text-gray-700">{v?.remainingStock ?? "-"}</td>
                        <td className="px-8 py-5 text-sm text-right">
                          <StatusPill variant={v?.active ? "green" : "red"}>{v?.active ? "Active" : "Inactive"}</StatusPill>
                        </td>
                        <td className="px-8 py-5 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => openVoucherDetail(v)}
                              disabled={loading || selectedVoucherLoading}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => openVoucherEdit(v)}
                              disabled={loading || selectedVoucherLoading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-red-600 text-red-700 hover:bg-red-50 hover:text-red-700"
                              onClick={() => {
                                setSelectedVoucher(v);
                                setDeleteOpen(true);
                              }}
                              disabled={loading || selectedVoucherLoading}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-10 text-sm text-gray-600" colSpan={8}>
                        No vouchers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>

          <CardFooter className="px-8 py-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">{loading ? "Loading..." : `${totalCount} voucher(s)`}</div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={loading}
              onClick={() => {
                if (loading) return;
                setLoading(true);
                setError("");
                  refreshVouchers()
                  .catch((err) => {
                    const message = err?.message || "Unable to load vouchers.";
                    setError(message);
                    notify.error("Load vouchers failed", message);
                  })
                  .finally(() => setLoading(false));
              }}
            >
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>

      <CreateVoucherDialog
        open={createOpen}
        onClose={() => {
          if (loading) {
            setCreateOpen(false);
            return;
          }
          setCreateOpen(false);
        }}
        onCreate={async (fd) => {
          try {
            const created = await createEnterpriseVoucher(fd);
            notify.success("Voucher created", created?.title ? `Created: ${created.title}` : "Created successfully.");
            await refreshVouchers();
            return true;
          } catch (err) {
            const message = err?.message || "Unable to create voucher.";
            notify.error("Create voucher failed", message);
            throw err;
          }
        }}
      />

      <VoucherDetailDialog
        open={detailOpen}
        voucher={selectedVoucher}
        onClose={() => {
          setDetailOpen(false);
          setSelectedVoucher(null);
        }}
      />

      <EditVoucherDialog
        open={editOpen}
        voucher={selectedVoucher}
        onClose={() => {
          if (selectedVoucherLoading) {
            setEditOpen(false);
            return;
          }
          setEditOpen(false);
        }}
        onSave={async (payload) => {
          const voucherId = selectedVoucher?.id;
          if (!voucherId) return false;
          try {
            const updated = await updateEnterpriseVoucher(voucherId, payload);
            notify.success("Voucher updated", updated?.title ? `Updated: ${updated.title}` : "Updated successfully.");
            await refreshVouchers();
            return true;
          } catch (err) {
            const message = err?.message || "Unable to update voucher.";
            notify.error("Update voucher failed", message);
            throw err;
          }
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete voucher"
        description={
          selectedVoucher?.title
            ? `Are you sure you want to delete "${selectedVoucher.title}"? This will mark it inactive.`
            : "Are you sure you want to delete this voucher?"
        }
        confirmText="Delete"
        confirmClassName="bg-red-600 hover:bg-red-500 focus:ring-red-200"
        onClose={() => setDeleteOpen(false)}
        confirmDisabled={loading}
        onConfirm={async () => {
          const voucherId = selectedVoucher?.id;
          if (!voucherId) return;
          try {
            await deleteEnterpriseVoucher(voucherId);
            notify.success("Voucher deleted", "Voucher has been marked inactive.");
            setDeleteOpen(false);
            await refreshVouchers();
          } catch (err) {
            notify.error("Delete voucher failed", err?.message || "Unable to delete voucher.");
          }
        }}
      />
    </EnterpriseLayout>
  );
}
