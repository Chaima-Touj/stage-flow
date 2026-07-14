import { useTranslation } from "react-i18next";
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
    <section className="news-section">
      <div className="news-section__inner">
        <div className="news-header">
          <span className="news-header__badge">📰 {t("landing.newsBadge")}</span>
          <h2 className="news-header__title">{t("landing.newsTitle")}</h2>
          <p className="news-header__sub">{t("landing.newsSub")}</p>
        </div>

        <div className="news-grid">
          {NEWS_ARTICLES.map((article) => (
            <article className="news-card" key={article.id}>
              <div className="news-card__img-wrap">
                <img src={article.image} alt="" className="news-card__img" loading="lazy" />
                <span className="news-card__category">{article.category}</span>
              </div>
              <div className="news-card__body">
                <div className="news-card__meta">
                  <span className="news-card__meta-item"><FiCalendar size={13} /> {formatDate(article.date, lang)}</span>
                  <span className="news-card__meta-item"><FiUser size={13} /> {t("landing.newsByAuthor", { author: article.author })}</span>
                </div>
                <h3 className="news-card__title">{article.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
