import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import ProfileView from "../../components/profile/ProfileView";
import ProfileEditor from "../../components/profile/ProfileEditor";
// Si le service n'existe pas encore, commente l'import et utilise les données simulées
// import { profileService } from "../../services/profile.service";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // 📌 DONNÉES SIMULÉES (à remplacer par l'appel API)
  const loadProfile = async () => {
    setLoading(true);
    try {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 500));

      const fakeProfile = {
        firstName: "Chaima",
        lastName: "Touj",
        email: "chaima@example.com",
        bio: "Étudiante en génie logiciel, passionnée par le développement web et l'intelligence artificielle.",
        education: {
          institution: "ESPRIT",
          degree: "Diplôme d'ingénieur en informatique",
          fieldOfStudy: "Génie logiciel",
          startDate: "2021-09-01",
          endDate: "2025-06-30",
          current: true,
          grade: "14.5/20",
          courses: ["Algorithmique", "Base de données", "Génie logiciel", "IA"],
        },
        experience: [
          {
            id: "1",
            company: "BeeCoders",
            position: "Stagiaire développeur full-stack",
            location: "Tunis",
            startDate: "2024-06-01",
            endDate: "2024-08-31",
            current: false,
            description: "Développement d'une plateforme de e-commerce avec MERN stack.",
            technologies: ["React", "Node.js", "MongoDB", "TypeScript"],
          },
        ],
        skills: [
          { id: "1", name: "React", level: "Avancé" },
          { id: "2", name: "Node.js", level: "Intermédiaire" },
          { id: "3", name: "MongoDB", level: "Intermédiaire" },
          { id: "4", name: "TypeScript", level: "Débutant" },
        ],
        languages: [
          { id: "1", name: "Français", level: "Courant" },
          { id: "2", name: "Anglais", level: "Intermédiaire" },
          { id: "3", name: "Arabe", level: "Natif" },
        ],
        cv: {
          fileName: "CV_Chaima_Touj.pdf",
          fileUrl: "#",
        },
        socialLinks: {
          linkedin: "https://linkedin.com/in/chaimatouj",
          github: "https://github.com/chaimatouj",
          portfolio: "https://chaimatouj.dev",
        },
      };

      setProfile(fakeProfile);
    } catch (err) {
      console.error("Erreur lors du chargement du profil", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditSuccess = () => {
    setIsEditing(false);
    loadProfile();
  };

  if (loading) {
    return (
      <DashboardLayout title="Profil">
        <p>Chargement...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mon Profil" subtitle={user?.name}>
      <div className="profile-page">
        <div className="profile-actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Voir le profil" : "Modifier le profil"}
          </button>
        </div>

        {isEditing ? (
          <ProfileEditor
            initialData={profile}
            onSuccess={handleEditSuccess}
          />
        ) : (
          <ProfileView profile={profile} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;