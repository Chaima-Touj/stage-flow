import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiTrash2, FiBell } from "react-icons/fi";
import "./NotificationPanel.css";

const TYPE_CONFIG = {
  success: { Icon: FiCheckCircle, color: "#10B981", bg: "#DCFCE7" },
  warning: { Icon: FiAlertTriangle, color: "#F59E0B", bg: "#FEF9C3" },
  error:   { Icon: FiAlertTriangle, color: "#EF4444", bg: "#FEE2E2" },
  info:    { Icon: FiInfo,         color: "#2563EB", bg: "#DBEAFE" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "À l'instant";
  if (mins < 60)  return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7)   return `Il y a ${days} j.`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function NotificationPanel({ notifications, onClose, onMarkAsRead, onMarkAllRead, onDelete }) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="np" role="dialog" aria-label="Notifications">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="np__header">
        <div className="np__header-left">
          <h3 className="np__title">Notifications</h3>
          {unreadCount > 0 && (
            <span className="np__unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="np__header-actions">
          {unreadCount > 0 && (
            <button className="np__mark-all" onClick={onMarkAllRead} title="Tout marquer comme lu">
              <FiCheckCircle size={13}/>
              Tout lire
            </button>
          )}
          <button className="np__close" onClick={onClose} aria-label="Fermer">
            <FiX size={15}/>
          </button>
        </div>
      </div>

      {/* ── Liste ───────────────────────────────────────────────────── */}
      <div className="np__list">
        {notifications.length === 0 ? (
          <div className="np__empty">
            <div className="np__empty-ico"><FiBell size={24}/></div>
            <p className="np__empty-txt">Aucune notification pour l'instant.</p>
            <span className="np__empty-sub">Vous serez notifié dès qu'il y a du nouveau.</span>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            return (
              <div
                key={n._id}
                className={`np__item ${!n.isRead ? "np__item--unread" : ""}`}
                onClick={() => !n.isRead && onMarkAsRead(n._id)}
                role={!n.isRead ? "button" : undefined}
                tabIndex={!n.isRead ? 0 : undefined}
              >
                <div className="np__item-icon" style={{ background: cfg.bg, color: cfg.color }}>
                  <cfg.Icon size={14}/>
                </div>
                <div className="np__item-body">
                  <div className="np__item-title">{n.title}</div>
                  <div className="np__item-msg">{n.message}</div>
                  <div className="np__item-time">{timeAgo(n.createdAt)}</div>
                </div>
                {!n.isRead && <div className="np__item-dot" aria-label="Non lu"/>}
                <button
                  className="np__item-del"
                  onClick={(e) => { e.stopPropagation(); onDelete(n._id); }}
                  aria-label="Supprimer"
                  title="Supprimer"
                >
                  <FiTrash2 size={13}/>
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
