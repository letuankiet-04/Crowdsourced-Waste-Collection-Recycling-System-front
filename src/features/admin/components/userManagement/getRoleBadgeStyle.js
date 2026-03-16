export default function getRoleBadgeStyle(roleName) {
  const role = String(roleName || "").toUpperCase();
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "CITIZEN":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "COLLECTOR":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "ENTERPRISE":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}
