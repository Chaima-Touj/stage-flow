import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUpload, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import api from "../../services/api.js";
import "./Offers.css";

export default function ApplyOffer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coverLetter, setCoverLetter] = useState("");
  const [file,         setFile]        = useState(null);
  const [loading,      setLoading]     = useState(false);
  const [success,      setSuccess]     = useState(false);
  const [error,        setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("offerId", id);
      formData.append("coverLetter", coverLetter);
      if (file) formData.append("cv", file);

      await api.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate("/dashboard/student/applications"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de la candidature");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout title="Candidature envoyée">
        <div className="card apply-success">
          <FiCheckCircle size={48} color="#10B981"/>
          <h2>Candidature envoyée avec succès !</h2>
          <p>Redirection vers vos candidatures...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Postuler à l'offre">
      <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft/> Retour
      </button>

      <form className="card apply-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label className="label">Lettre de motivation</label>
          <textarea
            className="input apply-textarea"
            placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={8}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">CV (PDF ou Word)</label>
          <label className="apply-file-upload">
            <FiUpload/>
            <span>{file ? file.name : "Cliquez pour sélectionner votre CV"}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              hidden
            />
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Envoi en cours..." : "Envoyer ma candidature"}
        </button>
      </form>
    </DashboardLayout>
  );
}
