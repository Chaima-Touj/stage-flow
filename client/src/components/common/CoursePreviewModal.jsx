import { useEffect, useCallback } from "react";
import { FiX, FiPlay, FiLock } from "react-icons/fi";
import "./CoursePreviewModal.css";

function getYoutubeId(url = "") {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s]{11})/);
  return m ? m[1] : null;
}

function getThumb(w) {
  if (w.thumbnail) return w.thumbnail;
  const ytId = getYoutubeId(w.videoUrl || "");
  return ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
}

export default function CoursePreviewModal({
  formation, week, allWeeks, onClose, onSelectWeek,
  isTrailer = false,
}) {
  /* Scroll lock */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* Escape key */
  const handleKey = useCallback((e) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const videoUrl = week?.videoUrl || "";
  const ytId = getYoutubeId(videoUrl);

  return (
    <div className="cpm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cpm-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="cpm-header">
          <div className="cpm-header__info">
            <span className="cpm-header__formation">{formation.title}</span>
            <span className="cpm-header__week">
              {isTrailer ? "Trailer de présentation" : `Semaine ${week.week} — ${week.content}`}
            </span>
          </div>
          <button className="cpm-close" onClick={onClose} aria-label="Fermer">
            <FiX size={18} />
          </button>
        </div>

        {/* ── Lecteur vidéo 16:9 ──────────────────────────────────────── */}
        <div className="cpm-player-wrap">
          {ytId ? (
            <iframe
              className="cpm-iframe"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={isTrailer ? "Trailer de présentation" : week.content}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          ) : videoUrl ? (
            <video
              className="cpm-video"
              controls
              autoPlay
              src={videoUrl}
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className="cpm-no-video">
              <FiPlay size={42} />
              <p>{isTrailer ? "Aperçu non disponible" : "Aperçu non disponible pour cette semaine"}</p>
            </div>
          )}
        </div>

        {/* ── Liste des semaines (masquée en mode trailer) ─────────────── */}
        {!isTrailer && (
          <div className="cpm-list">
            <h4 className="cpm-list__title">Programme complet</h4>
            <div className="cpm-list__scroll">
              {(allWeeks || []).map((w) => {
                const thumb = getThumb(w);
                const isActive = w.week === week.week;
                const hasVid = !!w.videoUrl;
                return (
                  <button
                    key={w.week}
                    className={`cpm-item${isActive ? " cpm-item--active" : ""}${!hasVid ? " cpm-item--locked" : ""}`}
                    onClick={() => hasVid && onSelectWeek(w)}
                    disabled={!hasVid}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="cpm-item__thumb">
                      {thumb ? (
                        <img src={thumb} alt="" loading="lazy" />
                      ) : (
                        <div className="cpm-item__thumb-sk" />
                      )}
                      {hasVid
                        ? <span className="cpm-item__play"><FiPlay size={9} /></span>
                        : <span className="cpm-item__lock"><FiLock size={10} /></span>
                      }
                      {w.duree && <span className="cpm-item__dur">{w.duree}</span>}
                    </div>
                    <div className="cpm-item__info">
                      <span className="cpm-item__label">Sem. {w.week}</span>
                      <span className="cpm-item__content">{w.content}</span>
                    </div>
                    {w.gratuit && !isActive && (
                      <span className="cpm-item__free">Aperçu gratuit</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
