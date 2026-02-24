import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { PATHS } from "../../app/routes/paths.js";
import { cn } from "../lib/cn.js";

export default function UserMenu({ displayName, roleLabel, onLogout, links = [] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const avatarLetter = useMemo(() => {
    if (!displayName || displayName === "Loading...") return "?";
    return String(displayName).trim().slice(0, 1).toUpperCase() || "?";
  }, [displayName]);

  useEffect(() => {
    function onPointerDown(e) {
      if (!open) return;
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setOpen(false);
    }

    function onKeyDown(e) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-3 pl-6 border-l border-gray-200 hover:bg-gray-50 rounded-2xl py-2 pr-3 transition"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-base font-semibold text-gray-900">{displayName}</span>
          <span className="text-sm">
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 font-semibold border border-emerald-100">
              {roleLabel}
            </span>
          </span>
        </div>

        <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg border-2 border-white shadow-sm">
          {avatarLetter}
        </div>
        <ChevronDown className={cn("h-5 w-5 text-gray-500 transition", open ? "rotate-180" : "")} aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-gray-100 shadow-xl overflow-hidden z-50"
          role="menu"
        >
          {links.map((link, idx) => (
            <Link
              key={idx}
              to={link.to}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {/* Simple logic to pick an icon based on label, or fallback to User */}
              {link.label.toLowerCase().includes("setting") ? (
                <Settings className="h-4 w-4 text-gray-500" aria-hidden="true" />
              ) : (
                <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
              )}
              {link.label}
            </Link>
          ))}
          
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            type="button"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
