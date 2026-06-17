import Sidebar from "./Sidebar.jsx";
import Topbar  from "./Topbar.jsx";

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="app-layout">
      <Sidebar/>
      <div className="main-content">
        <Topbar title={title} subtitle={subtitle}/>
        <div className="page-content fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
