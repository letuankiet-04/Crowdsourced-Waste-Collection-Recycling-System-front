import React, { useEffect, useMemo, useState, memo } from 'react';
import { User, MapPin, Edit, MessageSquare, Activity, Save, X, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import useStoredUser from '../../hooks/useStoredUser.js';
import { cn } from '../../lib/cn.js';
import { updateProfile } from '../../../services/auth.service.js';
import TextField from '../../ui/TextField.jsx';
import Button from '../../ui/Button.jsx';
import ValidationError from '../../ui/ValidationError.jsx';
import usePasswordVisibility from '../../hooks/usePasswordVisibility.js';
import { changePassword } from '../../../services/auth.service.js';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

const DetailRow = memo(function DetailRow({ label, value, isEditing, name, onChange, type = "text" }) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
      ) : (
        <div className="text-gray-900 font-medium text-base min-h-[24px]">{value}</div>
      )}
    </div>
  );
});

const ProfileHeader = memo(function ProfileHeader({ fullName, role, location, avatarUrl, isEditing, pending, onEdit, onCancel, onSave }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
      <div className="relative flex-shrink-0">
        <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <User size={64} className="text-orange-400" />
          )}
        </div>
      </div>
      <div className="flex-1 text-center md:text-left space-y-2 mt-2">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
          <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
          <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold tracking-widest uppercase border border-gray-200">
            {role}
          </span>
        </div>
        <div className="flex items-center justify-center md:justify-start text-gray-500 gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span>{location}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 md:mt-2 w-full md:w-auto justify-center">
        {isEditing ? (
          <>
            <button
              onClick={onCancel}
              disabled={pending}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={pending}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 text-sm disabled:opacity-70"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm"
            >
              <Edit size={16} />
              Edit
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 text-sm">
              <MessageSquare size={16} />
              Contact
            </button>
          </>
        )}
      </div>
    </div>
  );
});

const PersonalDetailsCard = memo(function PersonalDetailsCard({ formData, isEditing, onChange, location }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <User className="text-emerald-500" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
      </div>
      <div className="space-y-8 flex-1">
        <DetailRow label="Full Name" value={formData.fullName} isEditing={isEditing} name="fullName" onChange={onChange} />
        <DetailRow label="Email Address" value={formData.email} isEditing={false} name="email" onChange={onChange} />
        <DetailRow label="Phone Number" value={formData.phone} isEditing={isEditing} name="phone" onChange={onChange} />
        {isEditing ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address Details</div>
            <input
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                name="ward"
                placeholder="Ward"
                value={formData.ward}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        ) : (
          <DetailRow label="Primary Location" value={location} />
        )}
      </div>
    </div>
  );
});

const SystemInfoCard = memo(function SystemInfoCard({ isVerified, status, enterpriseId, enterpriseName, membership, createdAt, lastLogin }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-emerald-500" size={20} />
        <h2 className="text-lg font-bold text-gray-900">System Information</h2>
      </div>
      <div className="space-y-8 flex-1">
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Status</div>
          <div className={cn("flex items-center gap-2 font-bold text-sm w-fit", isVerified ? "text-emerald-500" : "text-gray-500")}>
            <div className={cn("w-2 h-2 rounded-full", isVerified ? "bg-emerald-500" : "bg-gray-400")} />
            {status} {isVerified && "& Verified"}
          </div>
        </div>
        {enterpriseId != null ? <DetailRow label="Enterprise ID" value={String(enterpriseId)} /> : null}
        {enterpriseName ? <DetailRow label="Enterprise Name" value={enterpriseName} /> : null}
        <DetailRow label="Membership Class" value={membership} />
        <DetailRow label="Registration Date" value={createdAt} />
        <DetailRow label="Last Login" value={lastLogin} />
      </div>
    </div>
  );
});

function SecuritySettingsCard() {
  const [pwdPending, setPwdPending] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const visCurrent = usePasswordVisibility(false);
  const visNext = usePasswordVisibility(false);
  const visConfirm = usePasswordVisibility(false);

  const handlePwdChange = (field) => (e) => {
    const val = e.target.value;
    setPwdForm((prev) => ({ ...prev, [field]: val }));
    setPwdError('');
    setPwdSuccess('');
  };

  const validatePwd = () => {
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) return 'Please fill in all password fields.';
    if (pwdForm.next.length < 8) return 'New password must be at least 8 characters.';
    if (pwdForm.next !== pwdForm.confirm) return 'New password and confirmation do not match.';
    if (pwdForm.current === pwdForm.next) return 'New password must be different from current password.';
    return '';
  };

  const handleUpdatePassword = async () => {
    const err = validatePwd();
    if (err) {
      setPwdError(err);
      return;
    }
    setPwdPending(true);
    setPwdError('');
    setPwdSuccess('');
    try {
      await changePassword({ currentPassword: pwdForm.current, newPassword: pwdForm.next });
      setPwdSuccess('Password updated successfully.');
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      setPwdError(e?.message || 'Failed to update password.');
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
        Updating your password regularly helps keep your account secure. Ensure your
        new password is at least 8 characters long and includes a mix of letters,
        numbers, and symbols.
      </p>
      <div className="my-4 h-px w-full bg-gray-200" />
      {pwdError ? <ValidationError className="mb-4" message={pwdError} /> : null}
      {pwdSuccess ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {pwdSuccess}
        </div>
      ) : null}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</div>
          <TextField
            id="current_password"
            type={visCurrent.visible ? 'text' : 'password'}
            value={pwdForm.current}
            onChange={handlePwdChange('current')}
            rightSlot={
              <button
                type="button"
                onClick={visCurrent.toggle}
                className="text-slate-500 hover:text-slate-700"
                aria-label={visCurrent.visible ? 'Hide password' : 'Show password'}
              >
                {visCurrent.visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</div>
            <TextField
              id="new_password"
              type={visNext.visible ? 'text' : 'password'}
              value={pwdForm.next}
              onChange={handlePwdChange('next')}
              rightSlot={
                <button
                  type="button"
                  onClick={visNext.toggle}
                  className="text-slate-500 hover:text-slate-700"
                  aria-label={visNext.visible ? 'Hide password' : 'Show password'}
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
              type={visConfirm.visible ? 'text' : 'password'}
              value={pwdForm.confirm}
              onChange={handlePwdChange('confirm')}
              rightSlot={
                <button
                  type="button"
                  onClick={visConfirm.toggle}
                  className="text-slate-500 hover:text-slate-700"
                  aria-label={visConfirm.visible ? 'Hide password' : 'Show password'}
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

export default function UserProfile({ user: propUser, className }) {
  const { user: storedUser } = useStoredUser();
  const user = propUser || storedUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
        setFormData({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            city: user.city || "",
            ward: user.ward || ""
        });
    }
  }, [user]);

  const role = useMemo(() => (user?.role || user?.roleCode || "User").toUpperCase(), [user?.role, user?.roleCode]);
  const enterpriseId = useMemo(() => user?.enterpriseId ?? user?.enterprise_id ?? null, [user?.enterpriseId, user?.enterprise_id]);
  const enterpriseName = useMemo(() => user?.enterpriseName ?? user?.enterprise_name ?? null, [user?.enterpriseName, user?.enterprise_name]);
  const location = useMemo(() => {
    if (formData.address) return formData.city ? `${formData.address}, ${formData.city}` : formData.address;
    if (formData.city) return formData.city;
    if (formData.ward) return `${formData.ward}`;
    return "Location not set";
  }, [formData.address, formData.city, formData.ward]);
  const status = useMemo(() => {
    if (!user?.status) return "Active";
    return user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase();
  }, [user?.status]);
  const isVerified = useMemo(() => status.toLowerCase() === 'active', [status]);
  const createdAt = useMemo(() => formatDate(user?.createdAt), [user?.createdAt]);
  const lastLogin = useMemo(() => formatDateTime(user?.lastLogin), [user?.lastLogin]);
  const membership = useMemo(() => {
    const totalPoints = user?.totalPoints;
    if (totalPoints) {
      if (totalPoints > 5000) return "Platinum Guardian";
      if (totalPoints > 1000) return "Gold Tier Guardian";
      return "Silver Collector";
    }
    if (role.includes("ADMIN")) return "System Administrator";
    if (role.includes("ENTERPRISE")) return "Enterprise Partner";
    return "Standard Member";
  }, [user?.totalPoints, role]);

  if (!user) {
      return (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 italic">
              Loading user profile...
          </div>
      );
  }

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
      setPending(true);
      try {
          // 1. Call API to update profile
          const updatedUser = await updateProfile({ ...user, ...formData });
          
          // 2. Update Session Storage
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          
          // 3. Force re-render (or trigger storage event) - simple reload for now or rely on hook if it listened to storage
          window.dispatchEvent(new Event("storage"));
          
          setIsEditing(false);
      } catch (error) {
          console.error("Failed to update profile", error);
          alert("Failed to update profile. Please try again.");
      } finally {
          setPending(false);
      }
  };

  const handleCancel = () => {
      // Revert to original user data
      setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          ward: user.ward || ""
      });
      setIsEditing(false);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <ProfileHeader
        fullName={formData.fullName || user.fullName}
        role={role}
        location={location}
        avatarUrl={user.avatarUrl}
        isEditing={isEditing}
        pending={pending}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonalDetailsCard
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
          location={location}
        />
        <SystemInfoCard
          isVerified={isVerified}
          status={status}
          enterpriseId={enterpriseId}
          enterpriseName={enterpriseName}
          membership={membership}
          createdAt={createdAt}
          lastLogin={lastLogin}
        />
      </div>
      <SecuritySettingsCard />
    </div>
  );
}
