import { useEffect, useMemo, useState } from "react";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import ValidationError from "../../../shared/ui/ValidationError.jsx";
import { getEnterpriseVouchers, createEnterpriseVoucher } from "../../../services/voucher.service.js";
import CreateVoucherDialog from "../components/rewards/CreateVoucherDialog.jsx";

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={7}>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-10 text-sm text-gray-600" colSpan={7}>
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
                getEnterpriseVouchers(activeOnly ? { active: true } : undefined)
                  .then((rows) => setVouchers(Array.isArray(rows) ? rows : []))
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
            const rows = await getEnterpriseVouchers(activeOnly ? { active: true } : undefined);
            setVouchers(Array.isArray(rows) ? rows : []);
            return true;
          } catch (err) {
            const message = err?.message || "Unable to create voucher.";
            notify.error("Create voucher failed", message);
            throw err;
          }
        }}
      />
    </EnterpriseLayout>
  );
}
