import { Link } from "react-router-dom";

export default function RecentReports() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 text-xl">Recent Reports</h3>
        <Link to="/reports" className="text-base font-medium text-green-600 hover:text-green-700 flex items-center transition-all duration-200 hover:translate-x-1 group">
          View all
          <svg className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Report</th>
              <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Created Date</th>
              <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-8 py-6 text-center text-sm text-gray-500" colSpan={3}>
                Wait API
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
