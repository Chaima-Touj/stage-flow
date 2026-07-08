import { useTranslation } from "react-i18next";
import { FiTool } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import "./StudentDashboard.css";

export default function AdminSectionPlaceholder({ titleKey }) {
  const { t } = useTranslation();
  return (
    <DashboardLayout title={t(titleKey)} subtitle={t("dashboard.admin.placeholderSubtitle")}>
      <div className="sd-card">
        <div className="sd-empty-box">
          <FiTool size={28} style={{ opacity: .3 }} />
          <p>{t("dashboard.admin.placeholderComingSoon")}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
