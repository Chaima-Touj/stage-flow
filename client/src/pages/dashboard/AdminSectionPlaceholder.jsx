import { FiTool } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import "./StudentDashboard.css";

export default function AdminSectionPlaceholder({ title }) {
  return (
    <DashboardLayout title={title} subtitle="Cette section arrive bientôt">
      <div className="sd-card">
        <div className="sd-empty-box">
          <FiTool size={28} style={{ opacity: .3 }} />
          <p>Section à venir</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
