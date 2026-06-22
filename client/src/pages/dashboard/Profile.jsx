import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import ProfileView from "../../components/profile/ProfileView";
import ProfileEditor from "../../components/profile/ProfileEditor";
import { profileService } from "../../services/profile.service";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await profileService.getMyProfile();

      const profileData =
        response?.data?.user ||
        response?.data?.profile ||
        response?.data;

      setProfile(profileData);
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err);

      setError(
        err?.response?.data?.message ||
          "Impossible de charger le profil."
      );

      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  let mounted = true;

  const fetchProfile = async () => {
    try {
      const response = await profileService.getMyProfile();

      if (!mounted) return;

      const profileData =
        response?.data?.user ||
        response?.data?.profile ||
        response?.data;

      setProfile(profileData);
    } catch (err) {
      if (mounted) {
        setError(
          err?.response?.data?.message ||
          "Impossible de charger le profil."
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  fetchProfile();

  return () => {
    mounted = false;
  };
}, []);

  const handleEditSuccess = async () => {
    setIsEditing(false);
    await loadProfile();
  };

  if (loading) {
    return (
      <DashboardLayout title="Profil">
        <div className="profile-loading">
          <p>Chargement du profil...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Profil">
        <div className="profile-error">
          <h3>Erreur</h3>
          <p>{error}</p>

          <button
            className="btn btn-primary"
            onClick={loadProfile}
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout title="Profil">
        <div className="profile-empty">
          <p>Aucune donnée de profil trouvée.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Profil ${
        profile?.firstName ||
        profile?.prenom ||
        user?.name ||
        ""
      }`}
    >
      {isEditing ? (
        <ProfileEditor
          profile={profile}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      ) : (
        <ProfileView
          profile={profile}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </DashboardLayout>
  );
};

export default Profile;