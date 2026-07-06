import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { notificationsService } from "../../services/notifications.service.js";
import "./DashboardLayout.css";

export default function DashboardLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sb_main");
    return saved !== null ? saved !== "false" : true;
  });

  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(() => {
    notificationsService.getAll()
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sb_main", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSidebarOpen = useCallback((value) => {
    setSidebarOpen(value);
    localStorage.setItem("sb_main", JSON.stringify(value));
  }, []);

  const handleMarkAsRead  = async (id) => { await notificationsService.markAsRead(id); loadNotifications(); };
  const handleMarkAllRead = async ()   => { await notificationsService.markAllRead(); loadNotifications(); };
  const handleDelete      = async (id) => { await notificationsService.delete(id); loadNotifications(); };

  return (
    <div className={`dl-shell ${sidebarOpen ? "dl-shell--open" : "dl-shell--closed"}`}>

      {/* Overlay mobile — ferme la sidebar en cliquant à côté */}
      <div
        className={`dl-overlay ${sidebarOpen ? "dl-overlay--visible" : ""}`}
        onClick={() => handleSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        unreadNotifCount={unreadCount}
      />

      <div className="dl-main">
        <Topbar
          title={title}
          subtitle={subtitle}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={handleToggleSidebar}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllRead={handleMarkAllRead}
          onDelete={handleDelete}
        />
        <div className="dl-content">
          {children}
        </div>
      </div>
    </div>
  );
}
