import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FiUsers, FiAlertTriangle, FiDownload, FiChevronDown as FiCaretDown,
  FiMoreVertical, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight,
  FiCheckCircle, FiXCircle,
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Modal from "../../components/common/Modal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { adminService } from "../../services/admin.service.js";
import "./StudentDashboard.css";
import "./AdminFormations.css";
import "./AdminUsers.css";

const ASSIGNABLE_ROLES = ["étudiant", "entreprise", "encadrant", "admin"];

const ROLE_LABEL_KEY = {
  "étudiant":  "adminUsers.roleStudent",
  "entreprise": "adminUsers.roleCompany",
  "encadrant":  "adminUsers.roleSupervisor",
  "admin":      "adminUsers.roleAdmin",
};

const ROLE_BADGE = {
  "étudiant":  "badge-primary",
  "entreprise": "badge-purple",
  "encadrant":  "badge-warning",
  "admin":      "badge-danger",
};

const AVATAR_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9", "#EC4899"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const PAGE_SIZES = [6, 10, 25, 50];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

function extractErrorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function csvEscape(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportUsersCSV(rows, t) {
  const headers = [
    t("adminUsers.csvColUser"), t("adminUsers.csvColEmail"), t("adminUsers.csvColRole"),
    t("adminUsers.csvColStatus"), t("adminUsers.csvColJoined"),
  ];
  const lines = rows.map((u) => [
    u.name, u.email, t(ROLE_LABEL_KEY[u.role] || u.role),
    u.isActive === false ? t("adminUsers.statusInactive") : t("adminUsers.statusActive"),
    formatDate(u.createdAt),
  ].map(csvEscape).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportUsersPDF(rows, t) {
  const head = [
    t("adminUsers.csvColUser"), t("adminUsers.csvColEmail"), t("adminUsers.csvColRole"),
    t("adminUsers.csvColStatus"), t("adminUsers.csvColJoined"),
  ];
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const dateStr = new Date().toLocaleDateString("fr-FR");

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(t("adminUsers.pdfTitle"), 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(t("adminFormations.pdfExportedOn", { date: dateStr }), 14, 21);

  const body = rows.map((u) => [
    u.name || "",
    u.email || "",
    t(ROLE_LABEL_KEY[u.role] || u.role),
    u.isActive === false ? t("adminUsers.statusInactive") : t("adminUsers.statusActive"),
    formatDate(u.createdAt),
  ]);

  autoTable(doc, {
    head: [head],
    body,
    startY: 27,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 3.5, textColor: [15, 23, 42] },
    headStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`utilisateurs-stageflow-${fileDate}.pdf`);
}

function getPageNumbers(current, total) {
  const delta = 1;
  const range = [];
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) range.push(i);
  if (range[0] > 1) {
    if (range[0] > 2) range.unshift("…");
    range.unshift(1);
  }
  if (range[range.length - 1] < total) {
    if (range[range.length - 1] < total - 1) range.push("…");
    range.push(total);
  }
  return range;
}

/* ─── Icône de tri ────────────────────────────────────────────────────────── */
function SortIcon({ active, dir }) {
  return (
    <span className="af-sort-ico" aria-hidden="true">
      <FiChevronUp size={10} className={active && dir === "asc" ? "af-sort-ico--active" : ""} />
      <FiChevronDown size={10} className={active && dir === "desc" ? "af-sort-ico--active" : ""} />
    </span>
  );
}

/* ─── Menu d'actions par ligne ("•••") ────────────────────────────────────── */
function RowActionsMenu({ isSelf, isActive, statusUpdating, onViewDetail, onToggleStatus, onChangeRole, onDelete }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="af-row-menu" ref={ref}>
      <button type="button" className="af-icon-btn" onClick={() => setOpen((v) => !v)} aria-label={t("adminUsers.actionsAriaLabel")}>
        <FiMoreVertical size={16} />
      </button>
      {open && (
        <div className="af-row-menu-dropdown" role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onViewDetail(); }}>
            {t("adminUsers.viewDetailAction")}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={(isSelf && isActive) || statusUpdating}
            title={isSelf && isActive ? t("adminUsers.cannotDisableSelf") : undefined}
            onClick={() => { setOpen(false); onToggleStatus(); }}
          >
            {isActive ? t("adminUsers.deactivateAction") : t("adminUsers.activateAction")}
          </button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onChangeRole(); }}>
            {t("adminUsers.changeRoleAction")}
          </button>
          <button
            type="button"
            role="menuitem"
            className="af-row-menu-danger"
            disabled={isSelf}
            title={isSelf ? t("adminUsers.cannotDeleteSelf") : undefined}
            onClick={() => { setOpen(false); onDelete(); }}
          >
            {t("notifications.deleteLabel")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Menu "Exporter" ──────────────────────────────────────────────────────── */
function ExportMenu({ onExportPDF, onExportCSV }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="af-export-menu" ref={ref}>
      <button type="button" className="af-toolbar-btn" onClick={() => setOpen((v) => !v)}>
        <FiDownload size={14} /> {t("adminFormations.export")} <FiCaretDown size={12} />
      </button>
      {open && (
        <div className="af-row-menu-dropdown af-export-dropdown" role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onExportPDF(); }}>
            {t("adminFormations.exportPdf")}
          </button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onExportCSV(); }}>
            {t("adminFormations.exportCsv")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function AdminUsers() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // Filtres
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Tri
  const [sortKey, setSortKey] = useState(null); // "name" | "role" | "status" | "createdAt" | null
  const [sortDir, setSortDir] = useState("asc");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modale détail (lecture seule)
  const [detailTarget, setDetailTarget] = useState(null);

  // Modale changement de rôle
  const [roleTarget,     setRoleTarget]     = useState(null);
  const [roleValue,      setRoleValue]      = useState("");
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleError,      setRoleError]      = useState("");

  // Modale suppression
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState("");

  // Action inline (activer/désactiver)
  const [statusActionId, setStatusActionId] = useState(null);
  const [rowActionError, setRowActionError] = useState("");

  const loadUsers = useCallback(() => {
    adminService.getUsers()
      .then(({ data }) => { setUsers(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortValue = (u, key) => {
    if (key === "name")      return u.name || "";
    if (key === "role")      return u.role || "";
    if (key === "status")    return u.isActive === false ? 0 : 1;
    if (key === "createdAt") return u.createdAt || "";
    return "";
  };

  const filteredSorted = useMemo(() => {
    let rows = users;

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((u) =>
        (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") rows = rows.filter((u) => u.role === roleFilter);
    if (statusFilter !== "all") {
      rows = rows.filter((u) => (statusFilter === "active" ? u.isActive !== false : u.isActive === false));
    }

    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const va = sortValue(a, sortKey);
        const vb = sortValue(b, sortKey);
        const cmp = typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "fr", { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [users, search, roleFilter, statusFilter, sortKey, sortDir]);

  const totalPages  = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems   = filteredSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const isSelf = (u) => String(u._id) === String(currentUser?._id);

  /* ── Activer / désactiver (action directe, sans confirmation) ───────────── */
  const handleToggleStatus = async (u) => {
    setRowActionError("");
    setStatusActionId(u._id);
    try {
      const { data } = await adminService.updateUserStatus(u._id, u.isActive === false);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? data.user : x)));
    } catch (err) {
      setRowActionError(extractErrorMessage(err, t("adminUsers.errors.statusUpdateFailed")));
    } finally {
      setStatusActionId(null);
    }
  };

  /* ── Changer le rôle ──────────────────────────────────────────────────── */
  const openRoleModal  = (u) => { setRoleError(""); setRoleValue(u.role); setRoleTarget(u); };
  const closeRoleModal = () => { if (!roleSubmitting) { setRoleTarget(null); setRoleError(""); } };

  const confirmRoleChange = async () => {
    setRoleSubmitting(true);
    setRoleError("");
    try {
      const { data } = await adminService.updateUserRole(roleTarget._id, roleValue);
      setUsers((prev) => prev.map((x) => (x._id === roleTarget._id ? data.user : x)));
      setRoleTarget(null);
    } catch (err) {
      setRoleError(extractErrorMessage(err, t("adminUsers.errors.roleUpdateFailed")));
    } finally {
      setRoleSubmitting(false);
    }
  };

  /* ── Suppression (avec garde-fou backend) ────────────────────────────────── */
  const openDelete  = (u) => { setDeleteError(""); setDeleteTarget(u); };
  const closeDelete = () => { if (!deleting) { setDeleteTarget(null); setDeleteError(""); } };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await adminService.deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((x) => x._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(extractErrorMessage(err, t("adminUsers.errors.deleteFailed")));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title={t("sidebar.admin.users")} subtitle={t("adminUsers.pageSubtitle")}>
      <div className="sd-root">

        <div className="af-card">

          {/* ── Barre d'outils ─────────────────────────────────────────── */}
          <div className="af-toolbar au-toolbar">
            <h1 className="af-toolbar-title">{t("sidebar.admin.users")}</h1>
            <div className="af-toolbar-actions">
              <input
                type="search"
                className="input au-search"
                placeholder={t("adminUsers.searchPlaceholder")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />

              <select
                className="af-select"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                aria-label={t("adminUsers.filterRoleAll")}
              >
                <option value="all">{t("adminUsers.filterRoleAll")}</option>
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{t(ROLE_LABEL_KEY[r])}</option>
                ))}
              </select>

              <select
                className="af-select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                aria-label={t("adminUsers.filterStatusAll")}
              >
                <option value="all">{t("adminUsers.filterStatusAll")}</option>
                <option value="active">{t("adminUsers.statusActive")}</option>
                <option value="inactive">{t("adminUsers.statusInactive")}</option>
              </select>

              <div className="af-select-wrap">
                <label htmlFor="au-page-size">{t("adminFormations.display")}</label>
                <select
                  id="au-page-size"
                  className="af-select"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <ExportMenu
                onExportPDF={() => exportUsersPDF(filteredSorted, t)}
                onExportCSV={() => exportUsersCSV(filteredSorted, t)}
              />
            </div>
          </div>

          {rowActionError && (
            <div className="af-form-error" style={{ margin: "0 20px 16px" }}>
              <FiAlertTriangle size={15} />
              <span>{rowActionError}</span>
            </div>
          )}

          {/* ── Tableau ────────────────────────────────────────────────── */}
          {loading ? (
            <div className="sd-skeleton" style={{ height: 240, margin: "0 20px 20px" }} />
          ) : error ? (
            <div className="sd-empty-box">
              <p>{t("adminUsers.errors.generic")}</p>
            </div>
          ) : filteredSorted.length === 0 ? (
            <div className="sd-empty-box">
              <FiUsers size={28} style={{ opacity: .3 }} />
              <p>{t("adminUsers.emptyState")}</p>
            </div>
          ) : (
            <>
              <div className="af-table-wrap">
                <table className="af-table">
                  <thead>
                    <tr>
                      <th className="af-th-sortable" onClick={() => toggleSort("name")}>
                        {t("adminUsers.colUser")} <SortIcon active={sortKey === "name"} dir={sortDir} />
                      </th>
                      <th className="af-th-sortable" onClick={() => toggleSort("role")}>
                        {t("adminUsers.colRole")} <SortIcon active={sortKey === "role"} dir={sortDir} />
                      </th>
                      <th className="af-th-sortable" onClick={() => toggleSort("status")}>
                        {t("adminUsers.colStatus")} <SortIcon active={sortKey === "status"} dir={sortDir} />
                      </th>
                      <th className="af-th-sortable" onClick={() => toggleSort("createdAt")}>
                        {t("adminUsers.colJoined")} <SortIcon active={sortKey === "createdAt"} dir={sortDir} />
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((u) => (
                      <tr key={u._id}>
                        <td className="af-cell-title">
                          <div className="af-formation-cell">
                            <div className="af-avatar af-avatar--placeholder" style={{ background: avatarColor(u.name) }}>
                              {u.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="au-user-cell">
                              <span className="af-formation-title-text">{u.name}</span>
                              <span className="au-user-email">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${ROLE_BADGE[u.role] || "badge-primary"}`}>
                            {t(ROLE_LABEL_KEY[u.role] || u.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.isActive === false ? "badge-danger" : "badge-success"}`}>
                            {u.isActive === false ? t("adminUsers.statusInactive") : t("adminUsers.statusActive")}
                          </span>
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td>
                          <RowActionsMenu
                            isSelf={isSelf(u)}
                            isActive={u.isActive !== false}
                            statusUpdating={statusActionId === u._id}
                            onViewDetail={() => setDetailTarget(u)}
                            onToggleStatus={() => handleToggleStatus(u)}
                            onChangeRole={() => openRoleModal(u)}
                            onDelete={() => openDelete(u)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ─────────────────────────────────────────── */}
              <div className="af-pagination">
                <button
                  type="button"
                  className="af-page-nav"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <FiChevronLeft size={14} /> {t("offers.previous")}
                </button>

                <div className="af-page-numbers">
                  {getPageNumbers(currentPage, totalPages).map((n, i) =>
                    n === "…"
                      ? <span key={`e${i}`} className="af-page-ellipsis">…</span>
                      : (
                        <button
                          key={n}
                          type="button"
                          className={`af-page-btn ${n === currentPage ? "af-page-btn--active" : ""}`}
                          onClick={() => setPage(n)}
                        >
                          {String(n).padStart(2, "0")}
                        </button>
                      )
                  )}
                </div>

                <button
                  type="button"
                  className="af-page-nav"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t("offers.next")} <FiChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modale détail (lecture seule) ───────────────────────────────── */}
      {detailTarget && (
        <Modal title={t("adminUsers.detailModalTitle")} onClose={() => setDetailTarget(null)} maxWidth={480}>
          <div className="au-detail">
            <div className="au-detail-head">
              <div className="af-avatar af-avatar--placeholder au-detail-avatar" style={{ background: avatarColor(detailTarget.name) }}>
                {detailTarget.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="au-detail-name">{detailTarget.name}</div>
                <div className="au-user-email">{detailTarget.email}</div>
              </div>
            </div>

            <div className="au-detail-badges">
              <span className={`badge ${ROLE_BADGE[detailTarget.role] || "badge-primary"}`}>
                {t(ROLE_LABEL_KEY[detailTarget.role] || detailTarget.role)}
              </span>
              <span className={`badge ${detailTarget.isActive === false ? "badge-danger" : "badge-success"}`}>
                {detailTarget.isActive === false ? t("adminUsers.statusInactive") : t("adminUsers.statusActive")}
              </span>
              <span className={`badge ${detailTarget.isVerified ? "badge-success" : "badge-warning"}`}>
                {detailTarget.isVerified
                  ? <><FiCheckCircle size={12} /> {t("adminUsers.verifiedYes")}</>
                  : <><FiXCircle size={12} /> {t("adminUsers.verifiedNo")}</>}
              </span>
            </div>

            <dl className="au-detail-list">
              <div className="au-detail-row">
                <dt>{t("adminUsers.detailFieldPhone")}</dt>
                <dd>{detailTarget.phone || "—"}</dd>
              </div>
              {detailTarget.role === "étudiant" && (
                <>
                  <div className="au-detail-row">
                    <dt>{t("adminUsers.detailFieldUniversity")}</dt>
                    <dd>{detailTarget.university || "—"}</dd>
                  </div>
                  <div className="au-detail-row">
                    <dt>{t("adminUsers.detailFieldSpecialty")}</dt>
                    <dd>{detailTarget.specialty || "—"}</dd>
                  </div>
                </>
              )}
              <div className="au-detail-row">
                <dt>{t("adminUsers.detailFieldJoined")}</dt>
                <dd>{formatDate(detailTarget.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </Modal>
      )}

      {/* ── Modale changement de rôle ────────────────────────────────────── */}
      {roleTarget && (
        <Modal
          title={t("adminUsers.changeRoleModalTitle")}
          onClose={closeRoleModal}
          maxWidth={420}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={closeRoleModal} disabled={roleSubmitting}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmRoleChange} disabled={roleSubmitting}>
                {roleSubmitting ? t("adminFormations.inProgress") : t("common.save")}
              </button>
            </>
          }
        >
          {roleError && (
            <div className="af-form-error">
              <FiAlertTriangle size={15} />
              <span>{roleError}</span>
            </div>
          )}
          <p className="au-detail-name" style={{ marginBottom: 12 }}>{roleTarget.name}</p>
          <div className="af-form-row">
            <label className="label" htmlFor="au-role-select">{t("adminUsers.changeRoleLabel")}</label>
            <select id="au-role-select" className="input" value={roleValue} onChange={(e) => setRoleValue(e.target.value)}>
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>{t(ROLE_LABEL_KEY[r])}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}

      {/* ── Modale suppression ──────────────────────────────────────────── */}
      {deleteTarget && (
        <Modal
          title={t("adminUsers.deleteUserModalTitle")}
          onClose={closeDelete}
          maxWidth={460}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={closeDelete} disabled={deleting}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" style={{ background: "#EF4444" }} onClick={confirmDelete} disabled={deleting}>
                {deleting ? t("settings.danger.modal.confirming") : t("settings.danger.modal.confirm")}
              </button>
            </>
          }
        >
          <p>
            {t("adminUsers.confirmDeleteQuestion")} <strong>{deleteTarget.name}</strong> ?
            {" "}{t("adminFormations.irreversibleNotice")}
          </p>
          {deleteError && (
            <div className="af-form-error" style={{ marginTop: 14 }}>
              <FiAlertTriangle size={15} />
              <span>{deleteError}</span>
            </div>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}
