import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { getCollectorReportDetail } from "../../../services/enterprise.service.js";
import { PATHS } from "../../../app/routes/paths.js";
import ReportPhotosCard from "../../../shared/layout/ReportPhotosCard.jsx";
import ReportLocationCard from "../../../shared/layout/ReportLocationCard.jsx";

export default function EnterpriseCollectorReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId]);

  const fetchReport = async (id) => {
    try {
      setLoading(true);
      const data = await getCollectorReportDetail(id);
      setReport(data);
    } catch (err) {
      console.error("Failed to fetch report detail:", err);
      setError("Failed to load report details.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case "COMPLETED": return "green";
      case "FAILED": return "red";
      default: return "yellow";
    }
  };

  if (loading) {
    return (
      <EnterpriseLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading report details...</div>
        </div>
      </EnterpriseLayout>
    );
  }

  if (error || !report) {
    return (
      <EnterpriseLayout>
        <div className="space-y-8">
           <PageHeader
            title="Report Not Found"
            description="The requested collector report could not be loaded."
            right={
              <Button variant="outline" onClick={() => navigate(PATHS.enterprise.collectorReports)}>
                Back to Reports
              </Button>
            }
          />
          <Card>
            <CardBody className="p-8">
              <div className="text-red-600">{error || "Report not found."}</div>
            </CardBody>
          </Card>
        </div>
      </EnterpriseLayout>
    );
  }

  const collectedCoords = (report.latitude && report.longitude) 
    ? { lat: Number(report.latitude), lng: Number(report.longitude) } 
    : null;

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Collector Report ${report.reportCode || report.id}`}
          description="Detailed view of the collector's submission."
          right={
            <Button variant="outline" onClick={() => navigate(PATHS.enterprise.collectorReports)}>
              Back to Reports
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card>
              <CardHeader className="py-6 px-8">
                <CardTitle className="text-xl">Report Information</CardTitle>
              </CardHeader>
              <CardBody className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Report ID</div>
                    <div className="mt-1 text-gray-900">{report.id}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Report Code</div>
                    <div className="mt-1 text-gray-900">{report.reportCode || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</div>
                    <div className="mt-1">
                      <StatusPill variant={getStatusVariant(report.status)}>{report.status}</StatusPill>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Points</div>
                    <div className="mt-1 text-gray-900 font-medium">{report.totalPoint}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collector Note</div>
                  <div className="mt-1 text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                    {report.collectorNote || "No notes provided."}
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="py-6 px-8">
                <CardTitle className="text-xl">Timestamps & IDs</CardTitle>
              </CardHeader>
              <CardBody className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected At</div>
                    <div className="mt-1 text-gray-900">
                      {report.collectedAt ? new Date(report.collectedAt).toLocaleString() : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Created At</div>
                    <div className="mt-1 text-gray-900">
                      {report.createdAt ? new Date(report.createdAt).toLocaleString() : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collector ID</div>
                    <div className="mt-1 text-gray-900">{report.collectorId}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collection Request ID</div>
                    <div className="mt-1 text-gray-900">{report.collectionRequestId}</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-8">
             <ReportLocationCard 
                reportedAddress="-" 
                collectedAddress="Location from GPS"
                collectedCoords={collectedCoords}
             />

             <ReportPhotosCard 
                collectedImages={report.imageUrls}
             />
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

