import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import TextField from "../../ui/TextField.jsx";
import Button from "../../ui/Button.jsx";
import ValidationError from "../../ui/ValidationError.jsx";
import usePasswordVisibility from "../../hooks/usePasswordVisibility.js";
import { changePassword } from "../../../services/auth.service.js";

export default function UserProfileSecuritySettingsCard() {
  const [pwdPending, setPwdPending] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const visNext = usePasswordVisibility(false);
  const visConfirm = usePasswordVisibility(false);

  const handlePwdChange = (field) => (e) => {
    const val = e.target.value;
    setPwdForm((prev) => ({ ...prev, [field]: val }));
    setPwdError("");
    setPwdSuccess("");
  };

  const validatePwd = () => {
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) return "Please fill in all password fields.";
    if (pwdForm.next.length < 8) return "New password must be at least 8 characters.";
    if (pwdForm.next !== pwdForm.confirm) return "New password and confirmation do not match.";
    if (pwdForm.current === pwdForm.next) return "New password must be different from current password.";
    return "";
  };

  const handleUpdatePassword = async () => {
    const err = validatePwd();
    if (err) {
      setPwdError(err);
      return;
    }
    setPwdPending(true);
    setPwdError("");
    setPwdSuccess("");
    try {
      await changePassword({ currentPassword: pwdForm.current, newPassword: pwdForm.next });
      setPwdSuccess("Password updated successfully.");
      setPwdForm({ current: "", next: "", confirm: "" });
    } catch (e) {
      setPwdError(e?.message || "Failed to update password.");
    } finally {
      setPwdPending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="text-emerald-500" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
      </div>
      <div className="text-base font-semibold text-gray-900 mb-2">Change Password</div>
      <p className="text-sm text-gray-600">
        Updating your password regularly helps keep your account secure. Ensure your new password is at least 8 characters long and includes a
        mix of letters, numbers, and symbols.
      </p>
      <div className="my-4 h-px w-full bg-gray-200" />
      {pwdError ? <ValidationError className="mb-4" message={pwdError} /> : null}
      {pwdSuccess ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{pwdSuccess}</div>
      ) : null}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</div>
          <TextField
            id="current_password"
            type="password"
            value={pwdForm.current}
            onChange={handlePwdChange("current")}
          />
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</div>
            <TextField
              id="new_password"
              type={visNext.visible ? "text" : "password"}
              value={pwdForm.next}
              onChange={handlePwdChange("next")}
              rightSlot={
                <button
                  type="button"
                  onClick={visNext.toggle}
                  className="text-slate-500 hover:text-slate-700"
                  aria-label={visNext.visible ? "Hide password" : "Show password"}
                >
                  {visNext.visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>
          <div className="grid gap-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</div>
            <TextField
              id="confirm_new_password"
              type={visConfirm.visible ? "text" : "password"}
              value={pwdForm.confirm}
              onChange={handlePwdChange("confirm")}
              rightSlot={
                <button
                  type="button"
                  onClick={visConfirm.toggle}
                  className="text-slate-500 hover:text-slate-700"
                  aria-label={visConfirm.visible ? "Hide password" : "Show password"}
                >
                  {visConfirm.visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>
        </div>
        <div className="pt-2">
          <Button onClick={handleUpdatePassword} disabled={pwdPending}>
            {pwdPending ? <Loader2 size={16} className="animate-spin" /> : null}
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}

