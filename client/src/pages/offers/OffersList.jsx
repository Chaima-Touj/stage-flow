import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiMapPin, FiClock, FiBookmark, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { offersService } from "../../services/offers.service.js";
import { favoritesService } from "../../services/favorites.service.js";
import "./Offers.css";

const normalizeOffer = (o) => ({
  ...o,
  companyName: o.companyName || o.company || "Entreprise",
  description: o.description || o.desc || "",
  skills:      (o.skills?.length ? o.skills : o.motsCles) || [],
  type:        o.type || "Stage",
  duration:    o.duration || "",
  location:    o.location || "",
  domain:      o.domain || o.specialite || "",
});

const PAGE_SIZE = 6;

export default function OffersList() {
  const [offers,     setOffers]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [domains,    setDomains]    = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading,    setLoading]    = useState(true);

  const [search,         setSearch]         = useState("");
  const [typeFilter,     setTypeFilter]     = useState("");
  const [domainFilter,   setDomainFilter]   = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    offersService.getDomains().then(({ data }) => setDomains(data.domains));
    favoritesService.getAll().then(({ data }) => {
      setFavoriteIds(new Set(data.favorites.map((f) => f._id)));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    if (search)         params.search   = search;
    if (typeFilter)     params.type     = typeFilter;
    if (domainFilter)   params.domain   = domainFilter;
    if (locationFilter) params.location = locationFilter;

    offersService.getAll(params)
      .then(({ data }) => {
        setOffers(data.offers.map(normalizeOffer));
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, typeFilter, domainFilter, locationFilter, page]);

  const updateFilter = (setter) => (value) => { setter(value); setPage(1); };

  const resetFilters = () => {
    setSearch(""); setTypeFilter(""); setDomainFilter(""); setLocationFilter(""); setPage(1);
  };

  const handleToggleFavorite = async (offerId) => {
    // Optimistic UI — on met à jour visuellement avant la réponse serveur
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.has(offerId) ? next.delete(offerId) : next.add(offerId);
      return next;
    });

    try {
      await favoritesService.toggle(offerId);
    } catch (err) {
      // Rollback en cas d'échec
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.has(offerId) ? next.delete(offerId) : next.add(offerId);
        return next;
      });
    }
  };

  const hasActiveFilters = search || typeFilter || domainFilter || locationFilter;

  return (
    <DashboardLayout title="Offres de stage" subtitle={`${pagination.total} offres disponibles`}>
      <div className="offers-toolbar card">
        <div className="offers-search-bar">
          <FiSearch/>
          <input
            placeholder="Rechercher par titre, entreprise, compétence..."
            value={search}
            onChange={(e) => updateFilter(setSearch)(e.target.value)}
          />
        </div>

        <select className="input offers-select" value={domainFilter} onChange={(e) => updateFilter(setDomainFilter)(e.target.value)}>
          <option value="">Tous les domaines</option>
          {domains.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <input
          className="input offers-select"
          placeholder="Ville..."
          value={locationFilter}
          onChange={(e) => updateFilter(setLocationFilter)(e.target.value)}
        />

        <div className="offers-filters">
          {["", "stage", "PFE", "alternance"].map((t) => (
            <button key={t}
              className={`filter-chip ${typeFilter === t ? "active" : ""}`}
              onClick={() => updateFilter(setTypeFilter)(t)}>
              {t || "Tous"}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button className="btn btn-ghost offers-reset" onClick={resetFilters}>
            <FiX size={14}/> Réinitialiser
          </button>
        )}
      </div>

      {loading ? (
        <div className="offers-loading">Chargement des offres...</div>
      ) : (
        <>
          <div className="offers-list-grid">
            {offers.map((o) => {
              const isFav = favoriteIds.has(o._id);
              return (
                <div key={o._id} className="offer-card card">
                  <div className="offer-card-top">
                    <div className="offer-card-logo">{o.companyName?.[0]?.toUpperCase()}</div>
                    <button
                      className={`offer-bookmark ${isFav ? "active" : ""}`}
                      onClick={() => handleToggleFavorite(o._id)}
                      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}>
                      <FiBookmark fill={isFav ? "currentColor" : "none"}/>
                    </button>
                  </div>

                  <h3 className="offer-card-title">{o.title}</h3>
                  <span className="offer-card-company">{o.companyName}</span>

                  <div className="offer-card-meta">
                    {o.location && <span><FiMapPin size={13}/> {o.location}</span>}
                    {o.duration && <span><FiClock size={13}/> {o.duration}</span>}
                  </div>

                  <p className="offer-card-desc">{o.description?.slice(0, 110)}{o.description?.length > 110 ? "..." : ""}</p>

                  <div className="offer-card-skills">
                    {o.skills.slice(0, 4).map((s) => <span key={s} className="badge badge-primary">{s}</span>)}
                  </div>

                  <div className="offer-card-footer">
                    <span className="badge badge-purple">{o.type}</span>
                    <Link to={`/dashboard/student/offers/${o._id}`} className="btn btn-primary btn-sm">
                      Voir l'offre
                    </Link>
                  </div>
                </div>
              );
            })}

            {offers.length === 0 && (
              <div className="offers-empty">Aucune offre ne correspond à votre recherche.</div>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="offers-pagination">
              <button className="btn btn-ghost" disabled={!pagination.hasPrev} onClick={() => setPage((p) => p - 1)}>
                <FiChevronLeft/> Précédent
              </button>
              <div className="pagination-pages">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`pagination-page ${p === pagination.page ? "active" : ""}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
                Suivant <FiChevronRight/>
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
