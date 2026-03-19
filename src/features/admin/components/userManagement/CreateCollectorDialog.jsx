import { useEffect, useState } from "react";
import { Building2, Eye, EyeOff, Lock, Mail, Phone, Truck, UserRound } from "lucide-react";
import useNotify from "../../../../shared/hooks/useNotify.js";
import { createCollectorAccount } from "../../../../services/admin.service.js";
import TextField from "../../../../shared/ui/TextField.jsx";
import LoadingButton from "../../../../shared/ui/LoadingButton.jsx";
import usePasswordVisibility from "../../../../shared/hooks/usePasswordVisibility.js";

function emptyToUndefined(value) {
  const v = String(value ?? "").trim();
  return v ? v : undefined;
}

function resolveErrorMessage(err) {
  const status = err?.status;
  if (status === 401 || status === 403) return "You are not authorized to perform this action.";
  if (status === 404) return "Enterprise not found.";
  if (typeof status === "number" && status >= 500) return "Server error while creating the collector account.";
  return err?.message || "Unable to create the collector account.";
}

export default function CreateCollectorDialog({ open, onClose, onCreated }) {
  const notify = useNotify();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    enterpriseId: "",
    employeeCode: "",
    vehicleType: "CAR",
    vehiclePlate: "",
  });
  const passwordVisibility = usePasswordVisibility(false);
  const confirmVisibility = usePasswordVisibility(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSubmitting(false);
    setValues({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      enterpriseId: "",
      employeeCode: "",
      vehicleType: "CAR",
      vehiclePlate: "",
    });
  }, [open]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    const next = e.target.value;
    setValues((prev) => ({ ...prev, [field]: next }));
    if (error) setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const phone = String(values.phone || "").trim();
    const password = String(values.password || "");
    const enterpriseId = Number(values.enterpriseId);
    const payload = {
      email: emptyToUndefined(values.email),
      password,
      fullName: emptyToUndefined(values.fullName),
      phone: emptyToUndefined(phone),
      enterpriseId,
      employeeCode: emptyToUndefined(values.employeeCode) ?? null,
      vehicleType: emptyToUndefined(values.vehicleType),
      vehiclePlate: emptyToUndefined(values.vehiclePlate),
    };

    if (!payload.email || !payload.password || !payload.fullName || !payload.phone) {
      setError("Please fill in Full name, Email, Phone, and Password.");
      return;
    }
    if (!/^\+?\d{9,15}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!Number.isInteger(payload.enterpriseId) || payload.enterpriseId <= 0) {
      setError("Enterprise ID must be a positive integer.");
      return;
    }
    if (!payload.vehicleType || !payload.vehiclePlate) {
      setError("Please fill in Vehicle type and Vehicle plate.");
      return;
    }
    if (payload.password !== String(values.confirmPassword || "")) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await notify.promise(createCollectorAccount(payload), {
        loadingTitle: "Creating collector",
        successTitle: "Success",
        successMessage: "Collector account created.",
        errorTitle: "Error",
      });
      await onCreated?.();
      onClose?.();
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in-up flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">Create Collector</h3>
          <button
            onClick={() => onClose?.()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
            ) : null}

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <UserRound className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Identity &amp; Contact
              </div>
              <div className="grid gap-3">
                <TextField
                  id="create_collector_full_name"
                  label="Full name"
                  autoComplete="name"
                  value={values.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Collector full name"
                  disabled={submitting}
                  leftIcon={UserRound}
                  accent="indigo"
                />
                <TextField
                  id="create_collector_email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange("email")}
                  placeholder="collector@example.com"
                  disabled={submitting}
                  leftIcon={Mail}
                  accent="indigo"
                />
                <TextField
                  id="create_collector_phone"
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={handleChange("phone")}
                  placeholder="09xxxxxxxx"
                  disabled={submitting}
                  leftIcon={Phone}
                  accent="indigo"
                />
              </div>
            </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Building2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Enterprise
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField
                  id="create_collector_enterprise_id"
                  label="Enterprise ID"
                  type="text"
                  autoComplete="off"
                  value={values.enterpriseId}
                  onChange={handleChange("enterpriseId")}
                  placeholder="e.g. 1"
                  disabled={submitting}
                  leftIcon={Building2}
                  accent="indigo"
                />
                <TextField
                  id="create_collector_employee_code"
                  label="Employee code"
                  type="text"
                  autoComplete="off"
                  value={values.employeeCode}
                  onChange={handleChange("employeeCode")}
                  placeholder="Optional"
                  disabled={submitting}
                  leftIcon={Building2}
                  accent="indigo"
                />
              </div>
            </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Truck className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Vehicle
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-2 text-left">
                  <label htmlFor="create_collector_vehicle_type" className="text-sm font-medium text-slate-800">
                    Vehicle type
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Truck className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <select
                      id="create_collector_vehicle_type"
                      value={values.vehicleType}
                      onChange={handleChange("vehicleType")}
                      className={[
                        "w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 shadow-sm outline-none transition",
                        "placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
                        "pl-10 pr-3",
                        "focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200",
                      ].join(" ")}
                      disabled={submitting}
                      required
                    >
                      <option value="TRUCK">Truck</option>
                      <option value="CAR">Car</option>
                      <option value="MOTORBIKE">Motorbike</option>
                    </select>
                  </div>
                </div>
                <TextField
                  id="create_collector_vehicle_plate"
                  label="Vehicle plate"
                  autoComplete="off"
                  value={values.vehiclePlate}
                  onChange={handleChange("vehiclePlate")}
                  placeholder="66K3-123.45"
                  disabled={submitting}
                  leftIcon={Truck}
                  accent="indigo"
                />
              </div>
            </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Credentials
              </div>
              <div className="mb-4 text-xs text-slate-500">Minimum password length: 6 characters.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField
                  id="create_collector_password"
                  label="Password"
                  type={passwordVisibility.visible ? "text" : "password"}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={handleChange("password")}
                  placeholder="At least 6 characters"
                  disabled={submitting}
                  leftIcon={Lock}
                  accent="indigo"
                  rightSlot={
                    <button
                      type="button"
                      onClick={passwordVisibility.toggle}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
                      aria-label={passwordVisibility.visible ? "Hide password" : "Show password"}
                      disabled={submitting}
                    >
                      {passwordVisibility.visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  }
                />
                <TextField
                  id="create_collector_confirm_password"
                  label="Confirm password"
                  type={confirmVisibility.visible ? "text" : "password"}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Re-enter the password"
                  disabled={submitting}
                  leftIcon={Lock}
                  accent="indigo"
                  rightSlot={
                    <button
                      type="button"
                      onClick={confirmVisibility.toggle}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
                      aria-label={confirmVisibility.visible ? "Hide password" : "Show password"}
                      disabled={submitting}
                    >
                      {confirmVisibility.visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  }
                />
              </div>
            </div>
          </div>
          </div>

          <div className="border-t border-gray-100 p-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <LoadingButton type="submit" loading={submitting} accent="indigo">
              Create
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
