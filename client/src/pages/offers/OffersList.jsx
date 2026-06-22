import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiSearch,
  FiMapPin,
  FiClock,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { offersService } from "../../services/offers.service.js";
import { favoritesService } from "../../services/favorites.service.js";
import "./Offers.css";

const normalizeOffer = (o) => ({
  ...o,
  companyName: o.companyName || o.company || "Entreprise",
  description: o.description || o.desc || "",
  skills:
    Array.isArray(o.skills) && o.skills.length
      ? o.skills
      : Array.isArray(o.skillsRequired) && o.skillsRequired.length
        ? o.skillsRequired
        : Array.isArray(o.motsCles)
          ? o.motsCles
          : [],
  type: o.type || "stage",
  duration: o.duration || "",
  location: o.location || "",
  domain: o.domain || o.specialite || "",
});

const PAGE_SIZE = 6;

const getPaginationRange = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }
  const listWithDots = [];
  let prev;
  for (let i of range) {
    if (prev) {
      if (i - prev === 2) listWithDots.push(prev + 1);
      else if (i - prev > 2) listWithDots.push("...");
    }
    listWithDots.push(i);
    prev = i;
  }
  return listWithDots;
};

const TYPE_FILTERS = [
  { label: "Tous", value: "" },
  { label: "Stage PFE", value: "stage PFE" },
];

export default function OffersList() {
  const { t } = useTranslation();
  const [urlParams] = useSearchParams();

  const [offers,      setOffers]      = useState([]);
  const [pagination,  setPagination]  = useState({ page: 1, totalPages: 1, total: 0 });
  const [domains,     setDomains]     = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading,     setLoading]     = useState(true);

  const [search,       setSearch]     = useState(urlParams.get("search") || "");
  const [typeFilter,   setTypeFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    offersService.getDomains().then(({ data }) => setDomains(data.domains));
    favoritesService.getAll()
      .then(({ data }) => setFavoriteIds(new Set(data.favorites.map((f) => f._id))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const params = { page, limit: PAGE_SIZE };
    if (search)       params.search = search;
    if (typeFilter)   params.type   = typeFilter;
    if (domainFilter) params.domain = domainFilter;

    Promise.resolve().then(() => { if (isCurrent) setLoading(true); });

    offersService.getAll(params)
      .then(({ data }) => {
        if (!isCurrent) return;
        setOffers(data.offers.map(normalizeOffer));
        setPagination(data.pagination);
      })
      .finally(() => { if (isCurrent) setLoading(false); });

    return () => { isCurrent = false; };
  }, [search, typeFilter, domainFilter, page]);

  const updateFilter = (setter) => (value) => { setter(value); setPage(1); };

  const resetFilters = () => {
    setSearch(""); setTypeFilter(""); setDomainFilter(""); setPage(1);
  };

  const handleToggleFavorite = async (offerId) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.has(offerId) ? next.delete(offerId) : next.add(offerId);
      return next;
    });
    try {
      await favoritesService.toggle(offerId);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.has(offerId) ? next.delete(offerId) : next.add(offerId);
        return next;
      });
    }
  };

  const hasActiveFilters = search || typeFilter || domainFilter;
  const paginationRange  = getPaginationRange(pagination.page, pagination.totalPages);

  return (
    <DashboardLayout
      title={t("offers.title")}
      subtitle={t("offers.available", { count: pagination.total })}
    >
      <div className="offers-toolbar card">
        <div className="offers-search-bar">
          <FiSearch size={14} />
          <input
            placeholder={t("offers.searchPlaceholder")}
            value={search}
            onChange={(e) => updateFilter(setSearch)(e.target.value)}
          />
        </div>

        <select
          className="input offers-select"
          value={domainFilter}
          onChange={(e) => updateFilter(setDomainFilter)(e.target.value)}
        >
          <option value="">{t("offers.allDomains")}</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div className="offers-filters">
          {TYPE_FILTERS.map((item) => (
            <button
              key={item.value}
              className={`filter-chip ${typeFilter === item.value ? "active" : ""}`}
              onClick={() => updateFilter(setTypeFilter)(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button className="btn btn-ghost offers-reset" onClick={resetFilters} type="button">
            <FiX size={14} /> {t("offers.reset")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="offers-loading">{t("common.loading")}</div>
      ) : (
        <>
          <section className="offers-list-wrap">
            <div className="offers-list-grid">
              {offers.map((o) => {
                const isFav = favoriteIds.has(o._id);
                return (
                  <article key={o._id} className="offer-card card">
                    <div className="offer-card-top">
                      <div className="offer-card-logo">{o.companyName?.[0]?.toUpperCase()}</div>
                      <button
                        className={`offer-bookmark ${isFav ? "active" : ""}`}
                        onClick={() => handleToggleFavorite(o._id)}
                        type="button"
                        aria-label="toggle favorite"
                      >
                        <FiBookmark size={16} fill={isFav ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <header className="offer-card-header">
                      <h3 className="offer-card-title" title={o.title}>{o.title}</h3>
                      <span className="offer-card-company">{o.companyName}</span>
                    </header>

                    <div className="offer-card-meta">
                      {o.location && <span><FiMapPin size={10} /> {o.location}</span>}
                      {o.duration && <span><FiClock size={10} /> {o.duration}</span>}
                    </div>

                    <p className="offer-card-desc" title={o.description}>
                      {o.description?.slice(0, 220)}
                      {o.description?.length > 220 ? "…" : ""}
                    </p>

                    <div className="offer-card-skills" aria-label="skills">
                      {(o.skills || []).slice(0, 4).map((s) => (
                        <span key={s} className="badge badge-primary">{s}</span>
                      ))}
                    </div>

                    <footer className="offer-card-footer">
                      <span className="badge badge-purple offer-card-type">{o.type}</span>
                      <Link
                        to={`/dashboard/student/offers/${o._id}`}
                        className="btn btn-primary btn-sm offer-card-cta"
                      >
                        {t("offers.viewOffer")}
                      </Link>
                    </footer>
                  </article>
                );
              })}

              {offers.length === 0 && (
                <div className="offers-empty">{t("offers.noResults")}</div>
              )}
            </div>
          </section>

          {pagination.totalPages > 1 && (
            <div className="offers-pagination">
              <button
                className="btn btn-ghost"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => p - 1)}
                type="button"
              >
                <FiChevronLeft size={14} /> {t("offers.previous")}
              </button>

              <div className="pagination-pages">
                {paginationRange.map((p, index) => {
                  if (p === "...") {
                    return <span key={`dots-${index}`} className="pagination-dots">...</span>;
                  }
                  return (
                    <button
                      key={`page-${p}`}
                      className={`pagination-page ${p === pagination.page ? "active" : ""}`}
                      onClick={() => setPage(p)}
                      type="button"
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                className="btn btn-ghost"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
                type="button"
              >
                {t("offers.next")} <FiChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}