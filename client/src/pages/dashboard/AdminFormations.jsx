import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FiPlus, FiBookOpen, FiAlertTriangle, FiDownload, FiChevronDown as FiCaretDown,
  FiMoreVertical, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Modal from "../../components/common/Modal.jsx";
import { formationsService } from "../../services/formations.service.js";
import "./StudentDashboard.css";
import "./AdminFormations.css";

const MODES = ["Présentiel", "En ligne", "Hybride"];

/* Les valeurs MODES restent en français (valeur DB/enum) ; seul l'affichage est traduit */
const MODE_LABEL_KEY = {
  "Présentiel": "formationDetail.modeOnsite",
  "En ligne":   "formationDetail.modeOnline",
  "Hybride":    "formationDetail.modeHybrid",
};

const MODE_BADGE = {
  "Présentiel": "badge-warning",
  "En ligne":   "badge-primary",
  "Hybride":    "badge-purple",
};

const LEVEL_BADGE = {
  "Débutant":                  "badge-success",
  "Débutant à Intermédiaire":  "badge-primary",
  "Intermédiaire":             "badge-warning",
  "Intermédiaire à Avancé":    "badge-purple",
};

function levelBadgeClass(level = "") {
  if (LEVEL_BADGE[level]) return LEVEL_BADGE[level];
  const l = level.toLowerCase();
  if (l.includes("avancé"))        return "badge-purple";
  if (l.includes("débutant"))      return "badge-success";
  if (l.includes("intermédiaire")) return "badge-warning";
  return "badge-primary";
}

const AVATAR_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9", "#EC4899"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const PAGE_SIZES = [6, 10, 25, 50];

const EMPTY_FORM = {
  title: "",
  duration: "",
  onsite: "",
  online: "",
  schedule: "",
  level: "",
  description: "",
  mode: "Hybride",
  certificate: false,
};

function formationToForm(formation) {
  return {
    title:       formation.title || "",
    duration:    formation.duration || "",
    onsite:      formation.price?.onsite || "",
    online:      formation.price?.online || "",
    schedule:    formation.schedule || "",
    level:       formation.level || "",
    description: formation.description || "",
    mode:        formation.mode || "Hybride",
    certificate: !!formation.certificate,
  };
}

function extractErrorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function csvEscape(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportFormationsCSV(rows, t) {
  const headers = [
    t("adminFormations.colFormation"), t("formationDetail.level"), t("formationDetail.mode"),
    t("adminFormations.csvOnsitePrice"), t("adminFormations.csvOnlinePrice"),
    t("formationDetail.duration"), t("adminFormations.colWeeks"),
  ];
  const lines = rows.map((f) => [
    f.title, f.level, f.mode, f.price?.onsite, f.price?.online, f.duration, f.weeks?.length ?? 0,
  ].map(csvEscape).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `formations-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportFormationsPDF(rows, t) {
  const head = [
    t("adminFormations.colFormation"), t("formationDetail.level"), t("formationDetail.mode"),
    t("adminFormations.colPrice"), t("formationDetail.duration"), t("adminFormations.colWeeks"),
  ];
  // 6 colonnes plutôt verbeuses (tarif, durée) : le paysage donne assez de
  // largeur pour rester lisible sans tronquer ; le portrait suffirait pour
  // un tableau à peu de colonnes.
  const orientation = head.length > 4 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });

  const dateStr = new Date().toLocaleDateString("fr-FR"); // JJ/MM/AAAA

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // --text
  doc.text(t("adminFormations.pdfTitle"), 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // --text-secondary
  doc.text(t("adminFormations.pdfExportedOn", { date: dateStr }), 14, 21);

  const body = rows.map((f) => [
    f.title || "",
    f.level || "—",
    f.mode || "—",
    `${f.price?.onsite || "—"} / ${f.price?.online || "—"}`,
    f.duration || "—",
    String(f.weeks?.length ?? 0),
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
  doc.save(`formations-stageflow-${fileDate}.pdf`);
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

/* ─── Icône de tri (double chevron, colore quand la colonne est active) ──── */
function SortIcon({ active, dir }) {
  return (
    <span className="af-sort-ico" aria-hidden="true">
      <FiChevronUp size={10} className={active && dir === "asc" ? "af-sort-ico--active" : ""} />
      <FiChevronDown size={10} className={active && dir === "desc" ? "af-sort-ico--active" : ""} />
    </span>
  );
}

/* ─── Menu d'actions par ligne ("•••" → Modifier / Supprimer) ────────────── */
function RowActionsMenu({ onEdit, onDelete }) {
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
      <button type="button" className="af-icon-btn" onClick={() => setOpen((v) => !v)} aria-label={t("adminFormations.actionsAriaLabel")}>
        <FiMoreVertical size={16} />
      </button>
      {open && (
        <div className="af-row-menu-dropdown" role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(); }}>
            {t("adminFormations.editAction")}
          </button>
          <button type="button" role="menuitem" className="af-row-menu-danger" onClick={() => { setOpen(false); onDelete(); }}>
            {t("notifications.deleteLabel")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Menu "Exporter" (PDF / CSV) ─────────────────────────────────────────── */
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

/* ─── Formulaire (création + édition) ────────────────────────────────────── */
function FormationForm({ initial, isEdit, submitting, formError, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial);
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.title.trim())    errors.title    = t("adminFormations.errors.titleRequired");
    if (!form.duration.trim()) errors.duration = t("adminFormations.errors.durationRequired");
    if (!form.onsite.trim())   errors.onsite   = t("adminFormations.errors.onsiteRequired");
    if (!form.online.trim())   errors.online   = t("adminFormations.errors.onlineRequired");
    if (!form.schedule.trim()) errors.schedule = t("adminFormations.errors.scheduleRequired");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title:       form.title.trim(),
      duration:    form.duration.trim(),
      price:       { onsite: form.onsite.trim(), online: form.online.trim() },
      schedule:    form.schedule.trim(),
      level:       form.level.trim(),
      description: form.description.trim(),
      mode:        form.mode,
      certificate: form.certificate,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="af-form-error">
          <FiAlertTriangle size={15} />
          <span>{formError}</span>
        </div>
      )}

      <div className="af-form-row">
        <label className="label" htmlFor="af-title">{t("adminFormations.titleLabel")}</label>
        <input id="af-title" className="input" value={form.title} onChange={set("title")} />
        {fieldErrors.title && <span className="af-field-error">{fieldErrors.title}</span>}
      </div>

      <div className="af-form-grid">
        <div className="af-form-row">
          <label className="label" htmlFor="af-duration">{t("adminFormations.durationLabel")}</label>
          <input id="af-duration" className="input" placeholder={t("adminFormations.durationPlaceholder")} value={form.duration} onChange={set("duration")} />
          {fieldErrors.duration && <span className="af-field-error">{fieldErrors.duration}</span>}
        </div>
        <div className="af-form-row">
          <label className="label" htmlFor="af-level">{t("formationDetail.level")}</label>
          <input id="af-level" className="input" placeholder={t("adminFormations.levelPlaceholder")} value={form.level} onChange={set("level")} />
        </div>
      </div>

      <div className="af-form-grid">
        <div className="af-form-row">
          <label className="label" htmlFor="af-onsite">{t("adminFormations.onsiteLabel")}</label>
          <input id="af-onsite" className="input" placeholder={t("adminFormations.onsitePlaceholder")} value={form.onsite} onChange={set("onsite")} />
          {fieldErrors.onsite && <span className="af-field-error">{fieldErrors.onsite}</span>}
        </div>
        <div className="af-form-row">
          <label className="label" htmlFor="af-online">{t("adminFormations.onlineLabel")}</label>
          <input id="af-online" className="input" placeholder={t("adminFormations.onlinePlaceholder")} value={form.online} onChange={set("online")} />
          {fieldErrors.online && <span className="af-field-error">{fieldErrors.online}</span>}
        </div>
      </div>

      <div className="af-form-row">
        <label className="label" htmlFor="af-schedule">{t("adminFormations.scheduleLabel")}</label>
        <input id="af-schedule" className="input" placeholder={t("adminFormations.schedulePlaceholder")} value={form.schedule} onChange={set("schedule")} />
        {fieldErrors.schedule && <span className="af-field-error">{fieldErrors.schedule}</span>}
      </div>

      <div className="af-form-grid">
        <div className="af-form-row">
          <label className="label" htmlFor="af-mode">{t("formationDetail.mode")}</label>
          <select id="af-mode" className="input" value={form.mode} onChange={set("mode")}>
            {MODES.map((m) => <option key={m} value={m}>{t(MODE_LABEL_KEY[m])}</option>)}
          </select>
        </div>
        <div className="af-form-row af-form-row--checkbox">
          <label className="af-checkbox-label" htmlFor="af-certificate">
            <input id="af-certificate" type="checkbox" checked={form.certificate} onChange={set("certificate")} />
            {t("adminFormations.certificateIssued")}
          </label>
        </div>
      </div>

      <div className="af-form-row">
        <label className="label" htmlFor="af-description">{t("profileEditor.description")}</label>
        <textarea id="af-description" className="input" rows={3} value={form.description} onChange={set("description")} />
      </div>

      <div className="modal-footer" style={{ padding: "16px 0 0", borderTop: "none" }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t("adminFormations.inProgress") : isEdit ? t("common.save") : t("adminFormations.create")}
        </button>
      </div>
    </form>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function AdminFormations() {
  const { t } = useTranslation();
  const [formations, setFormations] = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [error,       setError]     = useState(false);

  const [formModal,  setFormModal]  = useState(null); // null | "create" | formation object
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null); // null | formation object
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState("");

  // Tri
  const [sortKey, setSortKey] = useState(null); // "title" | "level" | "price" | "duration" | null
  const [sortDir, setSortDir] = useState("asc");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const loadFormations = useCallback(() => {
    formationsService.getAll()
      .then(({ data }) => { setFormations(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadFormations(); }, [loadFormations]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortValue = (f, key) => {
    if (key === "title")    return f.title || "";
    if (key === "level")    return f.level || "";
    if (key === "price")    return f.price?.onsite || "";
    if (key === "duration") return f.duration || "";
    return "";
  };

  const filteredSorted = useMemo(() => {
    let rows = formations;
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const cmp = sortValue(a, sortKey).localeCompare(sortValue(b, sortKey), "fr", { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [formations, sortKey, sortDir]);

  const totalPages  = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems   = filteredSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => { setFormError(""); setFormModal("create"); };
  const openEdit   = (formation) => { setFormError(""); setFormModal(formation); };
  const closeForm  = () => { if (!submitting) { setFormModal(null); setFormError(""); } };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    setFormError("");
    try {
      if (formModal === "create") {
        await formationsService.createFormation(payload);
      } else {
        await formationsService.updateFormation(formModal._id, payload);
      }
      setFormModal(null);
      loadFormations();
    } catch (err) {
      setFormError(extractErrorMessage(err, t("adminFormations.errors.generic")));
    } finally {
      setSubmitting(false);
    }
  };

  const openDelete  = (formation) => { setDeleteError(""); setDeleteTarget(formation); };
  const closeDelete = () => { if (!deleting) { setDeleteTarget(null); setDeleteError(""); } };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await formationsService.deleteFormation(deleteTarget._id);
      setDeleteTarget(null);
      loadFormations();
    } catch (err) {
      setDeleteError(extractErrorMessage(err, t("adminFormations.errors.deleteFailed")));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title={t("sidebar.admin.formations")} subtitle={t("adminFormations.pageSubtitle")}>
      <div className="sd-root">

        <div className="af-card">

          {/* ── Barre d'outils ─────────────────────────────────────────── */}
          <div className="af-toolbar">
            <h1 className="af-toolbar-title">{t("sidebar.admin.formations")}</h1>
            <div className="af-toolbar-actions">
              <div className="af-select-wrap">
                <label htmlFor="af-page-size">{t("adminFormations.display")}</label>
                <select
                  id="af-page-size"
                  className="af-select"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <ExportMenu
                onExportPDF={() => exportFormationsPDF(filteredSorted, t)}
                onExportCSV={() => exportFormationsCSV(filteredSorted, t)}
              />

              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <FiPlus size={15} /> {t("adminFormations.newFormation")}
              </button>
            </div>
          </div>

          {/* ── Tableau ────────────────────────────────────────────────── */}
          {loading ? (
            <div className="sd-skeleton" style={{ height: 240, margin: "0 20px 20px" }} />
          ) : error ? (
            <div className="sd-empty-box">
              <p>{t("dashboardFormations.error")}</p>
            </div>
          ) : formations.length === 0 ? (
            <div className="sd-empty-box">
              <FiBookOpen size={28} style={{ opacity: .3 }} />
              <p>{t("adminFormations.emptyState")}</p>
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <FiPlus size={15} /> {t("adminFormations.createFirst")}
              </button>
            </div>
          ) : (
            <>
              <div className="af-table-wrap">
                <table className="af-table">
                  <thead>
                    <tr>
                      <th className="af-th-sortable" onClick={() => toggleSort("title")}>
                        {t("adminFormations.colFormation")} <SortIcon active={sortKey === "title"} dir={sortDir} />
                      </th>
                      <th className="af-th-sortable" onClick={() => toggleSort("level")}>
                        {t("formationDetail.level")} <SortIcon active={sortKey === "level"} dir={sortDir} />
                      </th>
                      <th>{t("formationDetail.mode")}</th>
                      <th className="af-th-sortable" onClick={() => toggleSort("price")}>
                        {t("adminFormations.colPrice")} <SortIcon active={sortKey === "price"} dir={sortDir} />
                      </th>
                      <th className="af-th-sortable" onClick={() => toggleSort("duration")}>
                        {t("formationDetail.duration")} <SortIcon active={sortKey === "duration"} dir={sortDir} />
                      </th>
                      <th>{t("adminFormations.colWeeks")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((f) => (
                      <tr key={f._id}>
                        <td className="af-cell-title">
                          <div className="af-formation-cell">
                            {f.image
                              ? <img src={f.image} alt="" className="af-avatar" />
                              : (
                                <div className="af-avatar af-avatar--placeholder" style={{ background: avatarColor(f.title) }}>
                                  {f.title?.[0]?.toUpperCase() || "?"}
                                </div>
                              )}
                            <span className="af-formation-title-text">{f.title}</span>
                          </div>
                        </td>
                        <td>
                          {f.level
                            ? <span className={`badge ${levelBadgeClass(f.level)}`}>{f.level}</span>
                            : "—"}
                        </td>
                        <td>
                          <span className={`badge ${MODE_BADGE[f.mode] || "badge-primary"}`}>{MODE_LABEL_KEY[f.mode] ? t(MODE_LABEL_KEY[f.mode]) : f.mode}</span>
                        </td>
                        <td>{f.price?.onsite || "—"} / {f.price?.online || "—"}</td>
                        <td className="af-cell-duration" title={f.duration || ""}>{f.duration || "—"}</td>
                        <td>{f.weeks?.length ?? 0}</td>
                        <td>
                          <RowActionsMenu onEdit={() => openEdit(f)} onDelete={() => openDelete(f)} />
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

      {formModal && (
        <Modal
          title={formModal === "create" ? t("adminFormations.newFormation") : t("adminFormations.editFormationTitle", { title: formModal.title })}
          onClose={closeForm}
          maxWidth={640}
        >
          <FormationForm
            initial={formModal === "create" ? EMPTY_FORM : formationToForm(formModal)}
            isEdit={formModal !== "create"}
            submitting={submitting}
            formError={formError}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title={t("adminFormations.deleteFormationTitle")}
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
            {t("adminFormations.confirmDeleteQuestion")} <strong>{deleteTarget.title}</strong> ?
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
