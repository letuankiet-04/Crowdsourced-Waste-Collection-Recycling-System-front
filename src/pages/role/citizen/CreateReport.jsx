import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../components/layout/CD_Footer.jsx";
import CreateReportForm from "./create_report/CreateReportForm.jsx";
import RoleLayout from "../../../components/layout/RoleLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";

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
