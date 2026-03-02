import { Link } from "react-router-dom";
import StatusPill from "./StatusPill.jsx";
import { normalizeReportStatus, reportStatusToPillVariant } from "../lib/reportStatus.js";

export default function ReportRow({ report, onClick, idTo, showLocation = false, action }) {
  if (!report) return null;

  const interactive = typeof onClick === "function";
  const displayId = report?.reportCode ?? report?.code ?? report?.id ?? "";

  return (
    <tr
      className={["hover:bg-gray-50/40 transition-colors", interactive ? "cursor-pointer" : null].filter(Boolean).join(" ")}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "link" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick?.();
            }
          : undefined
      }
    >
      <td className="px-8 py-5 text-sm font-semibold">
        {idTo ? (
          <Link to={idTo} className="text-gray-900 hover:text-green-700 underline">
            {displayId}
          </Link>
        ) : (
          <span className="text-gray-900">{displayId}</span>
        )}
      </td>

      {showLocation && (
        <td className="px-8 py-5 text-sm text-gray-600">
          {report.address || (report.coords ? `${report.coords.lat.toFixed(5)}, ${report.coords.lng.toFixed(5)}` : "Unknown")}
        </td>
      )}

      <td className="px-8 py-5 text-sm text-gray-600">
        {report.createdAt ? new Date(report.createdAt).toLocaleString() : "-"}
      </td>

      <td className="px-8 py-5 text-sm text-right">
        <StatusPill variant={reportStatusToPillVariant(report.status)}>
          {normalizeReportStatus(report.status)}
        </StatusPill>
      </td>

      {action ? <td className="px-8 py-5 text-sm text-right">{action}</td> : null}
    </tr>
  );
}
