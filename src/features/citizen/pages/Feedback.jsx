import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import FeedbackForm from "../../../components/feedback/FeedbackForm.jsx";
import Sidebar from "../components/navigation/Sidebar";
import Navbar from "../components/navigation/CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";

export default function FeedbackPage() {
  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <CD_Footer />
        </div>
      }
      showBackgroundEffects
    >
      <div className="max-w-3xl mx-auto">
        <div className="animate-fade-in-up">
          <PageHeader
            className="mb-8"
            title="Feedback"
            description="Help us improve the environment by providing detailed feedback on your recent report."
          />
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <FeedbackForm />
        </div>
      </div>
    </RoleLayout>
  );
}
