import React, { useState, useEffect } from 'react';
import { User, MapPin, Edit, MessageSquare, Activity, Save, X, Loader2 } from 'lucide-react';
import useStoredUser from '../../hooks/useStoredUser.js';
import { cn } from '../../lib/cn.js';
import { updateProfile } from '../../../services/auth.service.js';

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

function DetailRow({ label, value, isEditing, name, onChange, type = "text" }) {
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

  // Extract fields with fallbacks
  const role = (user.role || user.roleCode || "User").toUpperCase();
  const enterpriseId = user.enterpriseId ?? user.enterprise_id ?? null;
  const enterpriseName = user.enterpriseName ?? user.enterprise_name ?? null;
  
  // Logic to determine location display
  let location = "Location not set";
  if (formData.address) {
      location = formData.city ? `${formData.address}, ${formData.city}` : formData.address;
  } else if (formData.city) {
      location = formData.city;
  } else if (formData.ward) {
      location = `${formData.ward}`;
  }

  // Status logic
  const status = user.status ? 
      (user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()) 
      : "Active"; 
  
  const isVerified = status.toLowerCase() === 'active';

  const createdAt = user.createdAt;
  const lastLogin = user.lastLogin;
  
  // Membership/Tier logic
  let membership = "Standard Member";
  if (user.totalPoints) {
      if (user.totalPoints > 5000) membership = "Platinum Guardian";
      else if (user.totalPoints > 1000) membership = "Gold Tier Guardian";
      else membership = "Silver Collector";
  } else if (role.includes("ADMIN")) {
      membership = "System Administrator";
  } else if (role.includes("ENTERPRISE")) {
      membership = "Enterprise Partner";
  }

  return (
    <div className={cn("space-y-6", className)}>
        {/* Header Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                     {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={formData.fullName} className="w-full h-full object-cover" />
                     ) : (
                        <User size={64} className="text-orange-400" />
                     )}
                </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center md:text-left space-y-2 mt-2">
                <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                    <h1 className="text-3xl font-bold text-gray-900">{formData.fullName || user.fullName}</h1>
                    <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold tracking-widest uppercase border border-gray-200">
                        {role}
                    </span>
                </div>
                <div className="flex items-center justify-center md:justify-start text-gray-500 gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{location}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4 md:mt-2 w-full md:w-auto justify-center">
                {isEditing ? (
                    <>
                        <button 
                            onClick={handleCancel}
                            disabled={pending}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
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
                            onClick={() => setIsEditing(true)}
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

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <User className="text-emerald-500" size={20} />
                    <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                </div>

                <div className="space-y-8 flex-1">
                    <DetailRow 
                        label="Full Name" 
                        value={formData.fullName} 
                        isEditing={isEditing} 
                        name="fullName" 
                        onChange={handleInputChange} 
                    />
                    <DetailRow 
                        label="Email Address" 
                        value={formData.email} 
                        isEditing={false} // Email usually not editable directly
                        name="email"
                        onChange={handleInputChange}
                    />
                    <DetailRow 
                        label="Phone Number" 
                        value={formData.phone} 
                        isEditing={isEditing} 
                        name="phone"
                        onChange={handleInputChange}
                    />
                    
                    {isEditing ? (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address Details</div>
                             <input 
                                name="address"
                                placeholder="Street Address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                             />
                             <div className="grid grid-cols-2 gap-2">
                                 <input 
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                 />
                                 <input 
                                    name="ward"
                                    placeholder="Ward"
                                    value={formData.ward}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                 />
                             </div>
                        </div>
                    ) : (
                        <DetailRow label="Primary Location" value={location} />
                    )}
                </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <Activity className="text-emerald-500" size={20} />
                    <h2 className="text-lg font-bold text-gray-900">System Information</h2>
                </div>

                <div className="space-y-8 flex-1">
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Status</div>
                        <div className={cn(
                            "flex items-center gap-2 font-bold text-sm w-fit",
                            isVerified ? "text-emerald-500" : "text-gray-500"
                        )}>
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isVerified ? "bg-emerald-500" : "bg-gray-400"
                            )} />
                            {status} {isVerified && "& Verified"}
                        </div>
                    </div>
                    {enterpriseId != null ? (
                        <DetailRow label="Enterprise ID" value={String(enterpriseId)} />
                    ) : null}
                    {enterpriseName ? <DetailRow label="Enterprise Name" value={enterpriseName} /> : null}
                    <DetailRow label="Membership Class" value={membership} />
                    <DetailRow label="Registration Date" value={formatDate(createdAt)} />
                    <DetailRow label="Last Login" value={formatDateTime(lastLogin)} />
                </div>
            </div>
        </div>
    </div>
  );
}
