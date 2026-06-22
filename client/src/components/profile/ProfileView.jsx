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
  const displayName =
  profile.name ||
  `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

const initials =
  profile.name?.charAt(0)?.toUpperCase() ||
  profile.firstName?.charAt(0)?.toUpperCase() ||
  "U";

  return (
    <div className="profile-view">

      {/* Identité */}
      <SectionCard title="Identité" icon={<FiUser size={18} />}>
  <div className="pv-identity">
    <div className="pv-avatar">
      {initials}
    </div>

    <div>
      <h2 className="pv-name">{displayName}</h2>

      <p className="pv-email">{profile.email}</p>

      {profile.phone && (
        <p className="pv-item-sub">
          <strong>Téléphone :</strong> {profile.phone}
        </p>
      )}

      {profile.role && (
        <p className="pv-item-sub">
          <strong>Rôle :</strong> {profile.role}
        </p>
      )}

      {profile.bio && (
        <p className="pv-bio">{profile.bio}</p>
      )}
    </div>
  </div>
</SectionCard>

      {/* Formation */}
      {(profile.university ||
  profile.specialty ||
  profile.education?.institution) && (
  <SectionCard
    title="Formation"
    icon={<FiBookOpen size={18} />}
  >
    <div className="pv-item">

      {profile.university && (
        <p className="pv-item-sub">
          <strong>Université :</strong>{" "}
          {profile.university}
        </p>
      )}

      {profile.specialty && (
        <p className="pv-item-sub">
          <strong>Spécialité :</strong>{" "}
          {profile.specialty}
        </p>
      )}

      {profile.education?.institution && (
        <p className="pv-item-sub">
          <strong>Établissement :</strong>{" "}
          {profile.education.institution}
        </p>
      )}

      {profile.education?.degree && (
        <p className="pv-item-sub">
          <strong>Diplôme :</strong>{" "}
          {profile.education.degree}
        </p>
      )}

      {profile.education?.fieldOfStudy && (
        <p className="pv-item-sub">
          <strong>Domaine :</strong>{" "}
          {profile.education.fieldOfStudy}
        </p>
      )}
    </div>
  </SectionCard>
)}

      {/* Expériences */}
      <SectionCard
  title="Expériences professionnelles"
  icon={<FiBriefcase size={18} />}
>
  {profile.experience?.length > 0 ? (
    profile.experience.map((exp, i) => (
      <div key={exp.id || i} className="pv-item">
        <div className="pv-item-header">
          <strong>
            {exp.position} · {exp.company}
          </strong>

          <span className="pv-date">
            {formatDate(exp.startDate)} —{" "}
            {exp.current ? "En cours" : formatDate(exp.endDate)}
          </span>
        </div>

        {exp.location && (
          <p className="pv-item-sub">{exp.location}</p>
        )}

        {exp.description && (
          <p className="pv-item-detail">{exp.description}</p>
        )}
      </div>
    ))
  ) : (
    <p className="pv-empty">
      Aucune expérience ajoutée.
    </p>
  )}
</SectionCard>

      {/* Compétences */}
      <SectionCard title="Compétences" icon={<FiCode size={18} />}>
  {profile.skills?.length > 0 ? (
    <div className="pv-skills">
      {profile.skills.map((s, i) => (
        <div key={s.id || i} className="pv-skill-item">
          <span className="pv-skill-name">{s.name}</span>
          <span
            className="badge"
            style={{
              background: (levelColors[s.level] || "#6B7280") + "20",
              color: levelColors[s.level] || "#6B7280",
            }}
          >
            {s.level}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="pv-empty">Aucune compétence ajoutée.</p>
  )}
</SectionCard>

      {/* Langues */}
      <SectionCard title="Langues" icon={<FiGlobe size={18} />}>
  {profile.languages?.length > 0 ? (
    <div className="pv-skills">
      {profile.languages.map((l, i) => (
        <div key={l.id || i} className="pv-skill-item">
          <span className="pv-skill-name">{l.name}</span>
          <span
            className="badge"
            style={{
              background: (levelColors[l.level] || "#6B7280") + "20",
              color: levelColors[l.level] || "#6B7280",
            }}
          >
            {l.level}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="pv-empty">Aucune langue ajoutée.</p>
  )}
</SectionCard>

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
      <SectionCard title="Liens sociaux" icon={<FiLink size={18} />}>
  {profile.socialLinks?.linkedin ||
  profile.socialLinks?.github ||
  profile.socialLinks?.portfolio ? (
    <div className="pv-links">
      {profile.socialLinks.linkedin && (
        <a
          href={profile.socialLinks.linkedin}
          target="_blank"
          rel="noreferrer"
          className="pv-link"
        >
          LinkedIn
        </a>
      )}

      {profile.socialLinks.github && (
        <a
          href={profile.socialLinks.github}
          target="_blank"
          rel="noreferrer"
          className="pv-link"
        >
          GitHub
        </a>
      )}

      {profile.socialLinks.portfolio && (
        <a
          href={profile.socialLinks.portfolio}
          target="_blank"
          rel="noreferrer"
          className="pv-link"
        >
          Portfolio
        </a>
      )}
    </div>
  ) : (
    <p className="pv-empty">
      Aucun lien social ajouté.
    </p>
  )}
</SectionCard>
    </div>
  );
}
