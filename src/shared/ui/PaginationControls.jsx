import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn.js";

export default function PaginationControls({ currentPage, totalPages, onPageChange, className = "" }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        type="button"
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg font-medium transition-all",
              currentPage === page ? "bg-green-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
            )}
            type="button"
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        type="button"
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
