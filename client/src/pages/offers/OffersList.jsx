import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiSearch, FiMapPin, FiClock, FiBookmark,
  FiChevronLeft, FiChevronRight, FiChevronDown,
  FiX, FiBriefcase, FiUsers, FiHome, FiStar,
  FiBell, FiFilter,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { offersService }    from "../../services/offers.service.js";
import { favoritesService } from "../../services/favorites.service.js";
import "./Offers.css";

/* ─── normalizer ─────────────────────────────────────────────────────────── */
const normalizeOffer = (o) => ({
  ...o,
  companyName: o.companyName || o.company || "Entreprise",
  description: o.description || o.desc || "",
  skills: Array.isArray(o.skills) && o.skills.length
    ? o.skills
    : Array.isArray(o.skillsRequired) && o.skillsRequired.length
      ? o.skillsRequired
      : Array.isArray(o.motsCles) ? o.motsCles : [],
  type:     o.type     || "stage",
  duration: o.duration || "",
  location: o.location || "",
  domain:   o.domain   || o.specialite || "",
});

const PAGE_SIZE = 6;

/* ─── pagination helper ──────────────────────────────────────────────────── */
const getPaginationRange = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta))
      range.push(i);
  }
  const out = [];
  let prev;
  for (const i of range) {
    if (prev) {
      if (i - prev === 2) out.push(prev + 1);
      else if (i - prev > 2) out.push("...");
    }
    out.push(i);
    prev = i;
  }
  return out;
};

const TYPE_FILTERS = [
  { label: "Tous",      value: "" },
  { label: "Stage PFE", value: "stage PFE" },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Il y a 1 jour";
  if (days < 7)  return `Il y a ${days} jours`;
  const w = Math.floor(days / 7);
  return w === 1 ? "Il y a 1 semaine" : `Il y a ${w} semaines`;
};

const LOGO_PALETTES = [
  { bg: "#fef3c7", color: "#d97706" },
  { bg: "#dbeafe", color: "#2563eb" },
  { bg: "#f3e8ff", color: "#7c3aed" },
  { bg: "#dcfce7", color: "#16a34a" },
  { bg: "#ffe4e6", color: "#e11d48" },
  { bg: "#e0f2fe", color: "#0284c7" },
];

const getLogoStyle = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  const { bg, color } = LOGO_PALETTES[Math.abs(h) % LOGO_PALETTES.length];
  return { background: bg, color };
};

/* ─── CustomSelect ───────────────────────────────────────────────────────── */
function CustomSelect({ value, onChange, options, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className={`cs-wrap ${compact ? "cs-wrap--compact" : ""}`} ref={ref}>
      <button type="button"
        className={`cs-trigger ${open ? "cs-trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}>
        <span className="cs-label">{selected?.label}</span>
        <FiChevronDown size={14} className={`cs-arrow ${open ? "cs-arrow--up" : ""}`}/>
      </button>
      {open && (
        <ul className="cs-menu" role="listbox">
          {options.map((opt) => (
            <li key={opt.value} role="option"
              aria-selected={opt.value === value}
              className={`cs-option ${opt.value === value ? "cs-option--active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Composant principal ────────────────────────────────────────────────── */
export default function OffersList() {
  const { t } = useTranslation();
  const [urlParams] = useSearchParams();

  /* state data */
  const [offers,      setOffers]      = useState([]);
  const [savedOffers, setSavedOffers] = useState([]);
  const [pagination,  setPagination]  = useState({ page: 1, totalPages: 1, total: 0 });
  const [domains,     setDomains]     = useState([]);
  const [locations,   setLocations]   = useState([]);
  const [durations,   setDurations]   = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading,     setLoading]     = useState(true);
  const [loadingFavs, setLoadingFavs] = useState(true);

  /* state filtres */
  const [search,         setSearch]         = useState(urlParams.get("search") || "");
  const [typeFilter,     setTypeFilter]     = useState("");
  const [domainFilter,   setDomainFilter]   = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [levelFilter,    setLevelFilter]    = useState("");
  const [sortFilter,     setSortFilter]     = useState("recent");
  const [page,           setPage]           = useState(1);
  const [activeTab,      setActiveTab]      = useState("all");

  /* ── chargement initial ──────────────────────────────────────────────── */
  useEffect(() => {
    // Domaines
    offersService.getDomains()
      .then(({ data }) => setDomains(data.domains))
      .catch(() => {});

    // Villes & durées
    offersService.getAll({ limit: 300 })
      .then(({ data }) => {
        const all = data.offers.map(normalizeOffer);
        setLocations([...new Set(all.map((o) => o.location).filter(Boolean))].sort());
        setDurations([...new Set(all.map((o) => o.duration).filter(Boolean))]);
      })
      .catch(() => {});

    // ── Favoris : charge uniquement les offres réellement sauvegardées ──
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingFavs(true);
    favoritesService.getAll()
      .then(({ data }) => {
        const favs = (data.favorites || []).map(normalizeOffer);
        setFavoriteIds(new Set(favs.map((f) => f._id)));
        setSavedOffers(favs);
      })
      .catch(() => {})
      .finally(() => setLoadingFavs(false));
  }, []);

  /* ── rechargement offres paginées ────────────────────────────────────── */
  useEffect(() => {
    let active = true;
    const params = { page, limit: PAGE_SIZE };
    if (search)                            params.search   = search;
    if (typeFilter)                        params.type     = typeFilter;
    if (domainFilter)                      params.domain   = domainFilter;
    if (locationFilter)                    params.location = locationFilter;
    if (durationFilter)                    params.duration = durationFilter;
    if (levelFilter)                       params.level    = levelFilter;
    if (sortFilter && sortFilter !== "recent") params.sort = sortFilter;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    offersService.getAll(params)
      .then(({ data }) => {
        if (!active) return;
        setOffers(data.offers.map(normalizeOffer));
        setPagination(data.pagination);
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [search, typeFilter, domainFilter, locationFilter, durationFilter, levelFilter, sortFilter, page]);

  /* ── toggle favori ───────────────────────────────────────────────────── */
  const handleToggleFavorite = async (offerId) => {
    const isFav = favoriteIds.has(offerId);

    // Mise à jour optimiste immédiate
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(offerId) : next.add(offerId);
      return next;
    });

    if (isFav) {
      // Retirer des sauvegardées
      setSavedOffers((prev) => prev.filter((o) => o._id !== offerId));
    } else {
      // Ajouter aux sauvegardées (cherche dans la liste courante)
      const offerToAdd = offers.find((o) => o._id === offerId);
      if (offerToAdd) {
        setSavedOffers((prev) => {
          // évite les doublons
          if (prev.some((o) => o._id === offerId)) return prev;
          return [...prev, offerToAdd];
        });
      }
    }

    try {
      await favoritesService.toggle(offerId);
    } catch {
      // Rollback en cas d'erreur API
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(offerId) : next.delete(offerId);
        return next;
      });
      if (isFav) {
        const offerToRestore = offers.find((o) => o._id === offerId);
        if (offerToRestore) {
          setSavedOffers((prev) => [...prev, offerToRestore]);
        }
      } else {
        setSavedOffers((prev) => prev.filter((o) => o._id !== offerId));
      }
    }
  };

  /* ── filtres helpers ─────────────────────────────────────────────────── */
  const updateFilter = (setter) => (value) => { setter(value); setPage(1); };

  const resetFilters = () => {
    setSearch(""); setTypeFilter(""); setDomainFilter("");
    setLocationFilter(""); setDurationFilter(""); setLevelFilter("");
    setSortFilter("recent"); setPage(1);
  };

  /* ── dérivés ─────────────────────────────────────────────────────────── */
  const hasActiveFilters = !!(search || typeFilter || domainFilter || locationFilter || durationFilter || levelFilter);
  const paginationRange  = getPaginationRange(pagination.page, pagination.totalPages);

  // ⚡ CORRECTION PRINCIPALE :
  // "saved"  → affiche savedOffers (favoris réels de l'utilisateur)
  // "new"    → affiche offres récentes (< 7 jours)
  // "all"    → affiche offres paginées normalement
  const visibleOffers = activeTab === "saved"
    ? savedOffers
    : activeTab === "new"
      ? offers.filter((o) => {
          if (!o.createdAt) return false;
          // eslint-disable-next-line react-hooks/purity
          return Math.floor((Date.now() - new Date(o.createdAt)) / 86400000) < 7;
        })
      : offers;

  const isLoadingCurrent = activeTab === "saved" ? loadingFavs : loading;

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout
      title={t("offers.title")}
      subtitle={t("offers.available", { count: pagination.total })}
    >

      {/* Stats bar */}
      <div className="offers-stats-bar">
        <div className="stat-card card">
          <div className="stat-card-icon stat-icon--indigo"><FiBriefcase size={20}/></div>
          <div className="stat-card-body">
            <div className="stat-card-value">{pagination.total || "—"}</div>
            <div className="stat-card-label">Offres disponibles</div>
            <div className="stat-card-sub">+12 cette semaine</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card-icon stat-icon--emerald"><FiUsers size={20}/></div>
          <div className="stat-card-body">
            <div className="stat-card-value-row">
              <span className="stat-card-value">23</span>
              <span className="stat-new-badge">NOUVEAU</span>
            </div>
            <div className="stat-card-label">Nouvelles offres</div>
            <div className="stat-card-sub">Depuis 7 jours</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card-icon stat-icon--slate"><FiHome size={20}/></div>
          <div className="stat-card-body">
            <div className="stat-card-value">15</div>
            <div className="stat-card-label">Entreprises actives</div>
            <div className="stat-card-sub">Recrutent actuellement</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card-icon stat-icon--amber"><FiStar size={20}/></div>
          <div className="stat-card-body">
            <div className="stat-card-value">98%</div>
            <div className="stat-card-label">Taux de satisfaction</div>
            <div className="stat-card-sub">De nos étudiants</div>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="offers-page-layout">
        <div className="offers-main-col">

          {/* Onglets + tri */}
          <div className="offers-tabs-bar">
            <div className="offers-tabs">
              {[
                { key: "all",   label: "Toutes les offres"   },
                { key: "new",   label: "Nouvelles offres"    },
                { key: "saved", label: `Offres sauvegardées${favoriteIds.size > 0 ? ` (${favoriteIds.size})` : ""}` },
              ].map((tab) => (
                <button key={tab.key} type="button"
                  className={`offers-tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tri — masqué en mode saved */}
            {activeTab !== "saved" && (
              <div className="offers-sort-row">
                <span className="sort-label">Trier par</span>
                <CustomSelect compact value={sortFilter}
                  onChange={(val) => { setSortFilter(val); setPage(1); }}
                  options={[
                    { label: "Plus récentes",  value: "recent"    },
                    { label: "Plus anciennes", value: "oldest"    },
                    { label: "Pertinence",     value: "relevance" },
                  ]}
                />
              </div>
            )}
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && activeTab !== "saved" && (
            <div className="active-filters-row">
              {locationFilter && (
                <span className="active-filter-tag">
                  <FiMapPin size={11}/> {locationFilter}
                  <button type="button" onClick={() => updateFilter(setLocationFilter)("")}><FiX size={10}/></button>
                </span>
              )}
              {durationFilter && (
                <span className="active-filter-tag">
                  <FiClock size={11}/> {durationFilter}
                  <button type="button" onClick={() => updateFilter(setDurationFilter)("")}><FiX size={10}/></button>
                </span>
              )}
              {domainFilter && (
                <span className="active-filter-tag">
                  {domainFilter}
                  <button type="button" onClick={() => updateFilter(setDomainFilter)("")}><FiX size={10}/></button>
                </span>
              )}
              {typeFilter && (
                <span className="active-filter-tag">
                  {typeFilter}
                  <button type="button" onClick={() => updateFilter(setTypeFilter)("")}><FiX size={10}/></button>
                </span>
              )}
              {levelFilter && (
                <span className="active-filter-tag">
                  {levelFilter}
                  <button type="button" onClick={() => updateFilter(setLevelFilter)("")}><FiX size={10}/></button>
                </span>
              )}
              <button type="button" className="filter-clear-all" onClick={resetFilters}>
                Tout effacer
              </button>
            </div>
          )}

          {/* Liste */}
          {isLoadingCurrent ? (
            <div className="offers-loading">{t("common.loading")}</div>
          ) : (
            <>
              <div className="offers-list">
                {visibleOffers.length === 0 ? (
                  <div className="offers-empty">
                    {activeTab === "saved"
                      ? "Aucune offre sauvegardée. Cliquez sur 🔖 pour sauvegarder une offre."
                      : activeTab === "new"
                        ? "Aucune nouvelle offre cette semaine."
                        : t("offers.noResults")}
                  </div>
                ) : (
                  visibleOffers.map((o) => {
                    const isFav      = favoriteIds.has(o._id);
                    const logoStyle  = getLogoStyle(o.companyName);
                    const datePosted = timeAgo(o.createdAt);
                    return (
                      <article key={o._id} className="offer-list-item card">
                        <div className="offer-list-logo" style={logoStyle}>
                          {o.companyName?.[0]?.toUpperCase()}
                        </div>
                        <div className="offer-list-body">
                          <div className="offer-list-main">
                            <h3 className="offer-list-title">{o.title}</h3>
                            <span className="offer-list-company">{o.companyName}</span>
                            <div className="offer-list-meta">
                              {o.location && <span><FiMapPin size={11}/> {o.location}</span>}
                            </div>
                            <div className="offer-list-skills">
                              {(o.skills || []).slice(0, 5).map((s) => (
                                <span key={s} className="offer-skill-tag">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="offer-list-right">
                            {datePosted && <span className="offer-list-date">{datePosted}</span>}
                            <span className="badge badge-purple offer-list-type">{o.type}</span>
                            {o.duration && (
                              <span className="offer-list-duration">
                                <FiClock size={11}/> {o.duration}
                              </span>
                            )}
                            <div className="offer-list-actions">
                              <Link to={`/dashboard/student/offers/${o._id}`}
                                className="btn btn-primary btn-sm">
                                {t("offers.viewOffer")}
                              </Link>
                              <button type="button" aria-label="toggle favorite"
                                className={`offer-bookmark ${isFav ? "active" : ""}`}
                                onClick={() => handleToggleFavorite(o._id)}>
                                <FiBookmark size={16} fill={isFav ? "currentColor" : "none"}/>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {/* Pagination — masquée en mode saved et new */}
              {activeTab === "all" && pagination.totalPages > 1 && (
                <div className="offers-pagination">
                  <span className="pagination-info">
                    Affichage {(pagination.page - 1) * PAGE_SIZE + 1} à{" "}
                    {Math.min(pagination.page * PAGE_SIZE, pagination.total)} sur{" "}
                    {pagination.total} offres
                  </span>
                  <div className="pagination-controls">
                    <button type="button" className="btn btn-ghost pagination-nav"
                      disabled={!pagination.hasPrev}
                      onClick={() => setPage((p) => p - 1)}>
                      <FiChevronLeft size={14}/>
                    </button>
                    <div className="pagination-pages">
                      {paginationRange.map((p, idx) =>
                        p === "..." ? (
                          <span key={`dots-${idx}`} className="pagination-dots">...</span>
                        ) : (
                          <button key={`page-${p}`} type="button"
                            className={`pagination-page ${p === pagination.page ? "active" : ""}`}
                            onClick={() => setPage(p)}>
                            {p}
                          </button>
                        )
                      )}
                    </div>
                    <button type="button" className="btn btn-ghost pagination-nav"
                      disabled={!pagination.hasNext}
                      onClick={() => setPage((p) => p + 1)}>
                      <FiChevronRight size={14}/>
                    </button>
                  </div>
                </div>
              )}

              {/* Compteur mode saved */}
              {activeTab === "saved" && savedOffers.length > 0 && (
                <div className="offers-pagination">
                  <span className="pagination-info">
                    {savedOffers.length} offre{savedOffers.length > 1 ? "s" : ""} sauvegardée{savedOffers.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar filtres — masquée en mode saved */}
        {activeTab !== "saved" && (
          <aside className="offers-filter-sidebar card">
            <div className="filter-sidebar-head">
              <h4 className="filter-sidebar-title">Filtres</h4>
              {hasActiveFilters && (
                <button type="button" className="filter-reset-btn" onClick={resetFilters}>
                  <FiX size={12}/> Réinitialiser
                </button>
              )}
            </div>

            <div className="filter-group">
              <label className="filter-label">Recherche</label>
              <div className="offers-search-bar">
                <FiSearch size={14}/>
                <input placeholder={t("offers.searchPlaceholder")}
                  value={search}
                  onChange={(e) => updateFilter(setSearch)(e.target.value)}/>
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Localisation</label>
              <CustomSelect value={locationFilter}
                onChange={(val) => updateFilter(setLocationFilter)(val)}
                options={[
                  { label: "Toutes les villes", value: "" },
                  ...locations.map((l) => ({ label: l, value: l })),
                ]}/>
            </div>

            <div className="filter-group">
              <label className="filter-label">Type de stage</label>
              <div className="filter-checkboxes">
                {TYPE_FILTERS.filter((f) => f.value).map((item) => (
                  <label key={item.value} className="filter-checkbox-row">
                    <input type="checkbox"
                      checked={typeFilter === item.value}
                      onChange={() => updateFilter(setTypeFilter)(typeFilter === item.value ? "" : item.value)}/>
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Durée</label>
              <CustomSelect value={durationFilter}
                onChange={(val) => updateFilter(setDurationFilter)(val)}
                options={[
                  { label: "Toutes les durées", value: "" },
                  ...durations.map((d) => ({ label: d, value: d })),
                ]}/>
            </div>

            <div className="filter-group">
              <label className="filter-label">Domaines</label>
              <CustomSelect value={domainFilter}
                onChange={(val) => updateFilter(setDomainFilter)(val)}
                options={[
                  { label: t("offers.allDomains"), value: "" },
                  ...domains.map((d) => ({ label: d, value: d })),
                ]}/>
            </div>

            <div className="filter-group">
              <label className="filter-label">Niveau d'études</label>
              <CustomSelect value={levelFilter}
                onChange={(val) => updateFilter(setLevelFilter)(val)}
                options={[
                  { label: "Tous les niveaux", value: ""          },
                  { label: "Licence",          value: "licence"   },
                  { label: "Master",           value: "master"    },
                  { label: "Ingénieur",        value: "ingenieur" },
                  { label: "Doctorat",         value: "doctorat"  },
                ]}/>
            </div>

            <button type="button" className="btn btn-primary offers-apply-btn">
              <FiFilter size={14}/> Appliquer les filtres
            </button>

            <div className="offers-notif-card">
              <div className="offers-notif-icon"><FiBell size={22}/></div>
              <h5 className="offers-notif-title">Ne manquez pas les nouvelles offres !</h5>
              <p className="offers-notif-text">
                Activez les notifications et recevez les meilleures offres directement.
              </p>
              <button type="button" className="offers-notif-btn">Activer les alertes</button>
            </div>
          </aside>
        )}
      </div>
    </DashboardLayout>
  );
}