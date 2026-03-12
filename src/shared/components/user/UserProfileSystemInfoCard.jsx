import { memo } from "react";
import { Activity } from "lucide-react";
import { cn } from "../../lib/cn.js";
import UserProfileDetailRow from "./UserProfileDetailRow.jsx";

const UserProfileSystemInfoCard = memo(function UserProfileSystemInfoCard({
  isVerified,
  status,
  enterpriseId,
  enterpriseName,
  membership,
  createdAt,
  lastLogin,
}) {
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
        {enterpriseId != null ? <UserProfileDetailRow label="Enterprise ID" value={String(enterpriseId)} /> : null}
        {enterpriseName ? <UserProfileDetailRow label="Enterprise Name" value={enterpriseName} /> : null}
        <UserProfileDetailRow label="Membership Class" value={membership} />
        <UserProfileDetailRow label="Registration Date" value={createdAt} />
        <UserProfileDetailRow label="Last Login" value={lastLogin} />
      </div>
    </div>
  );
});

export default UserProfileSystemInfoCard;

