import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import CreateReportForm from "./create_report/CreateReportForm.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";

export default function CreateReport() {
  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <CD_Footer />
        </div>
      }
    >
      <div className="animate-fade-in-up">
        <PageHeader
          className="mb-8"
          title="Create New Report"
          description="Help improve recycling by submitting accurate information"
        />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <CreateReportForm />
      </div>
    </RoleLayout>
  );
}
