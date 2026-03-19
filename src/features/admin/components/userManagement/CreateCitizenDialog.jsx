import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, UserRound } from "lucide-react";
import useNotify from "../../../../shared/hooks/useNotify.js";
import { createCitizenAccount } from "../../../../services/admin.service.js";
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
  if (typeof status === "number" && status >= 500) return "Server error while creating the citizen account.";
  return err?.message || "Unable to create the citizen account.";
}

export default function CreateCitizenDialog({ open, onClose, onCreated }) {
  const notify = useNotify();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
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
      fullName: "",
      email: "",
      phone: "",
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

    const phone = String(values.phone || "").trim();
    const password = String(values.password || "");

    const payload = {
      email: emptyToUndefined(values.email),
      password,
      fullName: emptyToUndefined(values.fullName),
      phone: emptyToUndefined(phone),
    };

    if (!payload.email || !payload.password || !payload.fullName || !payload.phone) {
      setError("Please fill in Full name, Email, Phone number, and Password.");
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
    if (payload.password !== String(values.confirmPassword || "")) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await notify.promise(createCitizenAccount(payload), {
        loadingTitle: "Creating citizen",
        successTitle: "Success",
        successMessage: "Citizen account created.",
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">Create Citizen</h3>
          <button
            onClick={() => onClose?.()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
          ) : null}

          <div className="grid gap-3">
            <TextField
              id="create_citizen_full_name"
              label="Full name"
              autoComplete="name"
              value={values.fullName}
              onChange={handleChange("fullName")}
              placeholder="Your name"
              disabled={submitting}
              leftIcon={UserRound}
              accent="emerald"
            />
            <TextField
              id="create_citizen_email"
              label="Email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              disabled={submitting}
              leftIcon={Mail}
              accent="emerald"
            />
            <TextField
              id="create_citizen_phone"
              label="Phone number"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={handleChange("phone")}
              placeholder="e.g. 0912345678"
              disabled={submitting}
              leftIcon={Phone}
              accent="emerald"
            />
            <TextField
              id="create_citizen_password"
              label="Password"
              type={passwordVisibility.visible ? "text" : "password"}
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange("password")}
              placeholder="At least 6 characters"
              disabled={submitting}
              leftIcon={Lock}
              accent="emerald"
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
              id="create_citizen_confirm_password"
              label="Confirm password"
              type={confirmVisibility.visible ? "text" : "password"}
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Re-enter your password"
              disabled={submitting}
              leftIcon={Lock}
              accent="emerald"
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

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <LoadingButton type="submit" loading={submitting} accent="emerald">
              Create
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
