import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn.js";

function getPaginationItems(currentPage, totalPages) {
  const maxFullVisible = 5;
  if (totalPages <= maxFullVisible) {
    const pages = [];
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    return pages;
  }

  const pages = [1, totalPages, currentPage - 1, currentPage, currentPage + 1]
    .filter((p) => p >= 1 && p <= totalPages);

  const uniqueSorted = [...new Set(pages)].sort((a, b) => a - b);
  const items = [];
  let prev = null;

  uniqueSorted.forEach((page) => {
    if (prev != null && page - prev > 1) items.push(`ellipsis-${prev}-${page}`);
    items.push(page);
    prev = page;
  });

  return items;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  disabled = false,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);

  const goToPage = (page) => {
    if (disabled) return;
    if (page < 1 || page > totalPages) return;
    if (page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className="h-10 px-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:text-green-700 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
        type="button"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1 px-1 py-1 rounded-xl bg-gray-50/70 border border-gray-200">
        {items.map((item) => {
          if (typeof item === "string") {
            return (
              <span
                key={item}
                className="w-9 h-9 flex items-center justify-center text-gray-400 select-none"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const page = item;
          const isActive = currentPage === page;

          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              disabled={disabled}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "bg-green-600 text-white shadow-md shadow-green-200"
                  : "text-gray-600 hover:bg-white hover:text-green-700"
              )}
              type="button"
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className="h-10 px-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:text-green-700 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
        type="button"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
