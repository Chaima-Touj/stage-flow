import { useRef, useState } from "react";
import { FiUpload, FiX, FiFile } from "react-icons/fi";
import "./FileUpload.css";

export default function FileUpload({
  onUpload,
  currentFile = "",
  accept = ".pdf,.doc,.docx",
  maxSize = 5 * 1024 * 1024,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      setError(`Fichier trop lourd (max ${Math.round(maxSize / 1024 / 1024)} MB)`);
      return;
    }

    setError("");
    onUpload(file);
  };

  const handleRemove = () => {
    setError("");
    onUpload(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="file-upload">
      {currentFile ? (
        <div className="file-upload-preview">
          <FiFile size={18} />
          <span className="file-upload-name">{currentFile}</span>
          <button
            type="button"
            className="file-upload-remove"
            onClick={handleRemove}
            aria-label="Supprimer le fichier"
          >
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="file-upload-btn"
          onClick={() => inputRef.current?.click()}
        >
          <FiUpload size={18} />
          <span>Choisir un fichier</span>
          <span className="file-upload-hint">PDF, DOC, DOCX — max {Math.round(maxSize / 1024 / 1024)} MB</span>
        </button>
      )}

      {error && <p className="file-upload-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="file-upload-input"
        aria-hidden="true"
      />
    </div>
  );
}
