export default function WaitApiPlaceholder({ className = "", height = "h-32" }) {
  return (
    <div className={`w-full ${height} border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center ${className}`}>
      <span className="text-gray-400 font-medium uppercase tracking-wide">waiting for API</span>
    </div>
  );
}
