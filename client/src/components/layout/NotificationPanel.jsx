import { useTranslation } from "react-i18next";
import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiTrash2 } from "react-icons/fi";
import "./NotificationPanel.css";

const typeIcons = {
  success: <FiCheckCircle color="#10B981"/>,
  warning: <FiAlertTriangle color="#F59E0B"/>,
  error:   <FiAlertTriangle color="#EF4444"/>,
  info:    <FiInfo color="#2563EB"/>,
};

export default function NotificationPanel({ notifications, onClose, onMarkAsRead, onMarkAllRead, onDelete }) {
  const { t } = useTranslation();

  return (
    <div className="notif-panel">
      <div className="notif-panel-header">
        <h3>{t("sidebar.student.notifications")}</h3>
        <div className="notif-panel-actions">
          {notifications.some((n) => !n.isRead) && (
            <button className="notif-mark-all" onClick={onMarkAllRead}>
              {t("common.view")} — tout marquer comme lu
            </button>
          )}
          <button className="notif-close" onClick={onClose}><FiX/></button>
        </div>
      </div>

      <div className="notif-panel-list">
        {notifications.length === 0 && (
          <p className="notif-empty">Aucune notification.</p>
        )}

        {notifications.map((n) => (
          <div key={n._id} className={`notif-item ${!n.isRead ? "unread" : ""}`}>
            <span className="notif-item-icon">{typeIcons[n.type] || typeIcons.info}</span>
            <div className="notif-item-body" onClick={() => !n.isRead && onMarkAsRead(n._id)}>
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <span className="notif-item-date">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button className="notif-item-delete" onClick={() => onDelete(n._id)}>
              <FiTrash2 size={14}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
