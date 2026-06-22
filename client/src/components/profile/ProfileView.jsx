import { FiUser, FiBookOpen, FiBriefcase, FiCode, FiGlobe, FiLink, FiDownload } from "react-icons/fi";
import SectionCard from "../common/SectionCard";

const levelColors = {
  "Débutant":      "#F59E0B",
  "Intermédiaire": "#2563EB",
  "Avancé":        "#10B981",
  "Expert":        "#8B5CF6",
  "Courant":       "#10B981",
  "Natif":         "#8B5CF6",
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

export default function ProfileView({ profile }) {
  if (!profile) return <p style={{ color: "var(--text-secondary)" }}>Aucun profil disponible.</p>;

  return (
    <div className="profile-view">

      {/* Identité */}
      <SectionCard title="Identité" icon={<FiUser size={18}/>}>
        <div className="pv-identity">
          <div className="pv-avatar">
            {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="pv-name">{profile.firstName} {profile.lastName}</h2>
            <p className="pv-email">{profile.email}</p>
            {profile.bio && <p className="pv-bio">{profile.bio}</p>}
          </div>
        </div>
      </SectionCard>

      {/* Formation */}
      {profile.education && (
        <SectionCard title="Formation" icon={<FiBookOpen size={18}/>}>
          <div className="pv-item">
            <div className="pv-item-header">
              <strong>{profile.education.institution}</strong>
              <span className="pv-date">
                {formatDate(profile.education.startDate)} — {profile.education.current ? "En cours" : formatDate(profile.education.endDate)}
              </span>
            </div>
            <p className="pv-item-sub">{profile.education.degree} · {profile.education.fieldOfStudy}</p>
            {profile.education.grade && <p className="pv-item-detail">Moyenne : {profile.education.grade}</p>}
            {profile.education.courses?.length > 0 && (
              <div className="pv-tags">
                {profile.education.courses.map((c) => (
                  <span key={c} className="badge badge-primary">{c}</span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Expériences */}
      {profile.experience?.length > 0 && (
        <SectionCard title="Expériences professionnelles" icon={<FiBriefcase size={18}/>}>
          {profile.experience.map((exp, i) => (
            <div key={exp.id || i} className="pv-item">
              <div className="pv-item-header">
                <strong>{exp.position} · {exp.company}</strong>
                <span className="pv-date">
                  {formatDate(exp.startDate)} — {exp.current ? "En cours" : formatDate(exp.endDate)}
                </span>
              </div>
              {exp.location && <p className="pv-item-sub">{exp.location}</p>}
              {exp.description && <p className="pv-item-detail">{exp.description}</p>}
              {exp.technologies?.length > 0 && (
                <div className="pv-tags">
                  {exp.technologies.map((t) => (
                    <span key={t} className="badge badge-primary">{t}</span>
                  ))}
                </div>
              )}
              {i < profile.experience.length - 1 && <hr className="pv-divider"/>}
            </div>
          ))}
        </SectionCard>
      )}

      {/* Compétences */}
      {profile.skills?.length > 0 && (
        <SectionCard title="Compétences" icon={<FiCode size={18}/>}>
          <div className="pv-skills">
            {profile.skills.map((s, i) => (
              <div key={s.id || i} className="pv-skill-item">
                <span className="pv-skill-name">{s.name}</span>
                <span className="badge" style={{
                  background: (levelColors[s.level] || "#6B7280") + "20",
                  color: levelColors[s.level] || "#6B7280",
                }}>
                  {s.level}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Langues */}
      {profile.languages?.length > 0 && (
        <SectionCard title="Langues" icon={<FiGlobe size={18}/>}>
          <div className="pv-skills">
            {profile.languages.map((l, i) => (
              <div key={l.id || i} className="pv-skill-item">
                <span className="pv-skill-name">{l.name}</span>
                <span className="badge" style={{
                  background: (levelColors[l.level] || "#6B7280") + "20",
                  color: levelColors[l.level] || "#6B7280",
                }}>
                  {l.level}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* CV */}
      {profile.cv?.fileName && (
        <SectionCard title="CV" icon={<FiDownload size={18}/>}>
          
          <a
            href={profile.cv.fileUrl || "#"}
            download={profile.cv.fileName}
            className="btn btn-outline btn-sm"
          >
            <FiDownload size={14}/> {profile.cv.fileName}
          </a>
        </SectionCard>
      )}

      {/* Liens sociaux */}
      {(profile.socialLinks?.linkedin || profile.socialLinks?.github || profile.socialLinks?.portfolio) && (
        <SectionCard title="Liens sociaux" icon={<FiLink size={18}/>}>
          <div className="pv-links">
            {profile.socialLinks.linkedin && (
              <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="pv-link">
                LinkedIn
              </a>
            )}
            {profile.socialLinks.github && (
              <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="pv-link">
                GitHub
              </a>
            )}
            {profile.socialLinks.portfolio && (
              <a href={profile.socialLinks.portfolio} target="_blank" rel="noreferrer" className="pv-link">
                Portfolio
              </a>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
