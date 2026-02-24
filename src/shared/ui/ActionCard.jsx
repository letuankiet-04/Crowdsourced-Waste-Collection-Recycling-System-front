import { Link } from "react-router-dom";
import { cn } from "../lib/cn.js";

const variants = {
  green: {
    bgColor: "bg-green-500",
    glowBg: "bg-gradient-to-br from-white to-green-500",
    hoverShadow: "group-hover:shadow-green-500/50",
  },
  blue: {
    bgColor: "bg-blue-500",
    glowBg: "bg-gradient-to-br from-white to-blue-500",
    hoverShadow: "group-hover:shadow-blue-500/50",
  },
  orange: {
    bgColor: "bg-orange-500",
    glowBg: "bg-gradient-to-br from-white to-orange-500",
    hoverShadow: "group-hover:shadow-orange-500/50",
  },
};

export default function ActionCard({
  to,
  title,
  icon,
  variant = "green",
  className,
}) {
  const styles = variants[variant] ?? variants.green;

  return (
    <Link to={to} className={cn("block group", className)}>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 h-64 overflow-hidden group/card">
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
            styles.glowBg,
          )}
        />

        <div className="absolute inset-0 -translate-x-full group-hover/card:animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none" />

        <div
          className={cn(
            "relative z-10 w-20 h-20 rounded-2xl text-white flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ring-4 ring-white/50",
            styles.bgColor,
            styles.hoverShadow,
          )}
        >
          {icon}
        </div>
        <span className="relative z-10 font-semibold text-gray-900 text-lg transition-colors duration-300 group-hover:text-gray-900">
          {title}
        </span>
      </div>
    </Link>
  );
}
