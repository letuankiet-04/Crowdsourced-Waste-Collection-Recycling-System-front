import { useEffect, useState } from "react";
import { Building2, Eye, EyeOff, Lock, Mail, MapPin, Phone } from "lucide-react";
import useNotify from "../../../../shared/hooks/useNotify.js";
import { createEnterpriseAccount } from "../../../../services/admin.service.js";
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
  if (typeof status === "number" && status >= 500) return "Server error while creating the enterprise account.";
  return err?.message || "Unable to create the enterprise account.";
}

export default function CreateEnterpriseDialog({ open, onClose, onCreated }) {
  const notify = useNotify();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    enterpriseName: "",
    enterpriseAddress: "",
    enterprisePhone: "",
    enterpriseEmail: "",
    password: "",
    confirmPassword: "",
  });
  const passwordVisibility = usePasswordVisibility(false);
  const confirmVisibility = usePasswordVisibility(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSubmitting(false);
    setValues({
      enterpriseName: "",
      enterpriseAddress: "",
      enterprisePhone: "",
      enterpriseEmail: "",
      password: "",
      confirmPassword: "",
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

    const enterpriseName = String(values.enterpriseName || "").trim();
    const enterpriseEmail = String(values.enterpriseEmail || "").trim();
    const enterprisePhone = String(values.enterprisePhone || "").trim();
    const password = String(values.password || "");

    const payload = {
      email: emptyToUndefined(enterpriseEmail),
      password,
      fullName: emptyToUndefined(enterpriseName),
      phone: emptyToUndefined(enterprisePhone),
      enterpriseName: emptyToUndefined(enterpriseName),
      enterpriseAddress: emptyToUndefined(values.enterpriseAddress),
      enterprisePhone: emptyToUndefined(enterprisePhone),
      enterpriseEmail: emptyToUndefined(enterpriseEmail),
    };

    if (!payload.enterpriseName) {
      setError("Please fill in Enterprise name.");
      return;
    }
    if (!payload.enterpriseEmail || !payload.enterprisePhone) {
      setError("Please fill in Enterprise email and Enterprise phone.");
      return;
    }
    if (!/^\+?\d{9,15}$/.test(enterprisePhone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== String(values.confirmPassword || "")) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await notify.promise(createEnterpriseAccount(payload), {
        loadingTitle: "Creating enterprise",
        successTitle: "Success",
        successMessage: "Enterprise account created.",
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
          <h3 className="text-xl font-bold text-gray-900">Create Enterprise</h3>
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

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Building2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Enterprise details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField
                  id="create_enterprise_name"
                  label="Enterprise name"
                  autoComplete="organization"
                  value={values.enterpriseName}
                  onChange={handleChange("enterpriseName")}
                  placeholder="Enterprise name"
                  disabled={submitting}
                  leftIcon={Building2}
                  accent="indigo"
                />
                <TextField
                  id="create_enterprise_email"
                  label="Enterprise email"
                  type="email"
                  autoComplete="email"
                  value={values.enterpriseEmail}
                  onChange={handleChange("enterpriseEmail")}
                  placeholder="enterprise@example.com"
                  disabled={submitting}
                  leftIcon={Mail}
                  accent="indigo"
                />
                <TextField
                  id="create_enterprise_phone"
                  label="Enterprise phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.enterprisePhone}
                  onChange={handleChange("enterprisePhone")}
                  placeholder="09xxxxxxxx"
                  disabled={submitting}
                  leftIcon={Phone}
                  accent="indigo"
                />
                <TextField
                  id="create_enterprise_address"
                  label="Enterprise address"
                  autoComplete="street-address"
                  value={values.enterpriseAddress}
                  onChange={handleChange("enterpriseAddress")}
                  placeholder="Address"
                  disabled={submitting}
                  leftIcon={MapPin}
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
                  id="create_enterprise_password"
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
                  id="create_enterprise_confirm_password"
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
