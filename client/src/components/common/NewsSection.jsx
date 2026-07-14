import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiCalendar, FiUser } from "react-icons/fi";
import { NEWS_ARTICLES } from "../../constants/newsArticles.js";
import "./NewsSection.css";

function formatDate(iso, lang) {
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/**
 * Grille "Actualités & Blogs" — données mock pour l'instant (voir
 * constants/newsArticles.js), prête à être branchée sur une vraie API/CMS
 * (même forme d'objet attendue).
 */
export default function NewsSection({ lang = "fr" }) {
  const { t } = useTranslation();

  if (NEWS_ARTICLES.length === 0) return null;

  return (
    <section id="news" className="news-section">
      <div className="news-section__inner">
        <div className="news-header">
          <span className="news-header__badge">📰 {t("landing.newsBadge")}</span>
          <h2 className="news-header__title">{t("landing.newsTitle")}</h2>
          <p className="news-header__sub">{t("landing.newsSub")}</p>
        </div>

        <div className="news-grid">
          {NEWS_ARTICLES.map((article) => {
            const imgClass = `news-card__img${article.imgFit === "cover" ? " news-card__img--cover" : ""}`;
            const content = (
              <>
                <div className="news-card__img-wrap">
                  <img
                    src={article.image}
                    alt=""
                    className={imgClass}
                    loading="lazy"
                    style={article.imgPosition ? { objectPosition: article.imgPosition } : undefined}
                  />
                  <span className="news-card__category">{article.category}</span>
                </div>
                <div className="news-card__body">
                  <div className="news-card__meta">
                    <span className="news-card__meta-item"><FiCalendar size={13} /> {formatDate(article.date, lang)}</span>
                    <span className="news-card__meta-item"><FiUser size={13} /> {t("landing.newsByAuthor", { author: article.author })}</span>
                  </div>
                  <h3 className="news-card__title">{article.title}</h3>
                </div>
              </>
            );

            if (article.link?.type === "external") {
              return (
                <a
                  key={article.id}
                  href={article.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-card news-card--clickable"
                >
                  {content}
                </a>
              );
            }

            if (article.link?.type === "internal") {
              return (
                <Link key={article.id} to={article.link.to} className="news-card news-card--clickable">
                  {content}
                </Link>
              );
            }

            return (
              <article className="news-card" key={article.id}>
                {content}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
