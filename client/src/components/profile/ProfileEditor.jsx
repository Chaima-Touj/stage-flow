import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  FiPlus,
  FiTrash2,
  FiUpload,
  FiUser,
  FiBriefcase,
  FiBookOpen,
  FiLink,
  FiCode,
  FiGlobe,
} from "react-icons/fi";
import SectionCard from "../common/SectionCard";
import FileUpload from "../common/FileUpload";
import "./ProfileEditor.css";

// Schéma de validation Yup
const experienceSchema = yup.object().shape({
  id: yup.string().nullable(),
  company: yup.string().required("L'entreprise est requise"),
  position: yup.string().required("Le poste est requis"),
  location: yup.string().nullable(),
  startDate: yup.date().required("Date de début requise"),
  endDate: yup.date().nullable(),
  current: yup.boolean().default(false),
  description: yup.string().nullable(),
  technologies: yup.array().of(yup.string()).nullable(),
});

const skillSchema = yup.object().shape({
  id: yup.string().nullable(),
  name: yup.string().required("La compétence est requise"),
  category: yup.string().nullable(),
  level: yup.string()
    .oneOf(["Débutant", "Intermédiaire", "Avancé", "Expert"])
    .required("Niveau requis"),
});

const languageSchema = yup.object().shape({
  id: yup.string().nullable(),
  name: yup.string().required("La langue est requise"),
  level: yup.string()
    .oneOf(["Débutant", "Intermédiaire", "Courant", "Natif"])
    .required("Niveau requis"),
});

const studentProfileSchema = yup.object().shape({
  firstName: yup.string().required("Prénom requis"),
  lastName: yup.string().required("Nom requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup.string()
    .when("isRegistering", {
      is: true,
      then: (schema) => schema.required("Mot de passe requis").min(6, "Minimum 6 caractères"),
      otherwise: (schema) => schema.nullable(),
    }),
  role: yup.string().oneOf(["étudiant", "entreprise"]).default("étudiant"),
  bio: yup.string().nullable(),
  education: yup.object().shape({
    institution: yup.string().required("Établissement requis"),
    degree: yup.string().required("Diplôme requis"),
    fieldOfStudy: yup.string().required("Domaine requis"),
    startDate: yup.date().required("Date de début requise"),
    endDate: yup.date().nullable(),
    current: yup.boolean().default(false),
    grade: yup.string().nullable(),
    courses: yup.array().of(yup.string()).nullable(),
  }),
  experience: yup.array().of(experienceSchema).default([]),
  skills: yup.array().of(skillSchema).default([]),
  languages: yup.array().of(languageSchema).default([]),
  cv: yup.object().shape({
    fileName: yup.string().nullable(),
    fileUrl: yup.string().nullable(),
  }),
  socialLinks: yup.object().shape({
    linkedin: yup.string().url("URL invalide").nullable(),
    github: yup.string().url("URL invalide").nullable(),
    portfolio: yup.string().url("URL invalide").nullable(),
  }),
});

/**
 * ProfileEditor - Formulaire complet d'édition du profil
 */
const ProfileEditor = ({
  initialData = {},
  isRegistering = false,
  onSuccess,
  onSubmit: externalSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultValues = {
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    password: "",
    role: initialData.role || "étudiant",
    bio: initialData.bio || "",
    education: initialData.education || {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      current: false,
      grade: "",
      courses: [],
    },
    experience: initialData.experience || [],
    skills: initialData.skills || [],
    languages: initialData.languages || [],
    cv: initialData.cv || { fileName: "", fileUrl: "" },
    socialLinks: initialData.socialLinks || { linkedin: "", github: "", portfolio: "" },
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(studentProfileSchema),
    defaultValues,
    context: { isRegistering },
  });

  const experienceFields = useFieldArray({
    control,
    name: "experience",
  });

  const skillsFields = useFieldArray({
    control,
    name: "skills",
  });

  const languagesFields = useFieldArray({
    control,
    name: "languages",
  });

  const handleCVUpload = (file) => {
    if (!file) {
      setValue("cv", { fileName: "", fileUrl: "" });
      return;
    }
    setValue("cv", {
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
    });
  };

  const onFormSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (externalSubmit) {
        await externalSubmit(data);
      } else {
        console.log("Données soumises :", data);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="profile-editor">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Identité */}
      <SectionCard title="Identité" icon={<FiUser size={18} />}>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Prénom</label>
            <input {...register("firstName")} className="input" placeholder="Prénom" />
            {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Nom</label>
            <input {...register("lastName")} className="input" placeholder="Nom" />
            {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="label">Email</label>
          <input {...register("email")} type="email" className="input" placeholder="email@exemple.com" />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {isRegistering && (
          <div className="form-group">
            <label className="label">Mot de passe</label>
            <input {...register("password")} type="password" className="input" placeholder="••••••••" />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>
        )}

        <div className="form-group">
          <label className="label">Bio</label>
          <textarea {...register("bio")} className="input" rows="3" placeholder="Parlez de vous..." />
        </div>
      </SectionCard>

      {/* Formation */}
      <SectionCard title="Formation" icon={<FiBookOpen size={18} />}>
        <div className="form-group">
          <label className="label">Établissement</label>
          <input {...register("education.institution")} className="input" placeholder="ESPRIT" />
          {errors.education?.institution && <p className="error-text">{errors.education.institution.message}</p>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Diplôme</label>
            <input {...register("education.degree")} className="input" placeholder="Diplôme d'ingénieur" />
          </div>
          <div className="form-group">
            <label className="label">Domaine</label>
            <input {...register("education.fieldOfStudy")} className="input" placeholder="Informatique" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Date de début</label>
            <input {...register("education.startDate")} type="date" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Date de fin</label>
            <input {...register("education.endDate")} type="date" className="input" />
          </div>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" {...register("education.current")} />
            En cours
          </label>
        </div>
        <div className="form-group">
          <label className="label">Moyenne / Mention</label>
          <input {...register("education.grade")} className="input" placeholder="14.5/20" />
        </div>
        <div className="form-group">
          <label className="label">Matières (séparées par des virgules)</label>
          <input {...register("education.courses")} className="input" placeholder="Algorithmique, BD, Génie logiciel" />
        </div>
      </SectionCard>

      {/* Expériences */}
      <SectionCard title="Expériences professionnelles" icon={<FiBriefcase size={18} />}>
        {experienceFields.fields.map((field, index) => (
          <div key={field.id} className="dynamic-item">
            <div className="form-row">
              <div className="form-group">
                <label className="label">Entreprise</label>
                <input {...register(`experience.${index}.company`)} className="input" placeholder="BeeCoders" />
              </div>
              <div className="form-group">
                <label className="label">Poste</label>
                <input {...register(`experience.${index}.position`)} className="input" placeholder="Développeur" />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Lieu</label>
              <input {...register(`experience.${index}.location`)} className="input" placeholder="Tunis" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Date de début</label>
                <input {...register(`experience.${index}.startDate`)} type="date" className="input" />
              </div>
              <div className="form-group">
                <label className="label">Date de fin</label>
                <input {...register(`experience.${index}.endDate`)} type="date" className="input" />
              </div>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" {...register(`experience.${index}.current`)} />
                En cours
              </label>
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea {...register(`experience.${index}.description`)} className="input" rows="2" />
            </div>
            <div className="form-group">
              <label className="label">Technologies (séparées par des virgules)</label>
              <input
                {...register(`experience.${index}.technologies`)}
                className="input"
                placeholder="React, Node.js"
              />
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => experienceFields.remove(index)}
            >
              <FiTrash2 /> Supprimer
            </button>
            <hr className="dynamic-divider" />
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
            experienceFields.append({
              company: "",
              position: "",
              location: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
              technologies: [],
            })
          }
        >
          <FiPlus /> Ajouter une expérience
        </button>
      </SectionCard>

      {/* Compétences */}
      <SectionCard title="Compétences" icon={<FiCode size={18} />}>
        {skillsFields.fields.map((field, index) => (
          <div key={field.id} className="dynamic-item inline-item">
            <div className="form-row">
              <div className="form-group">
                <label className="label">Compétence</label>
                <input {...register(`skills.${index}.name`)} className="input" placeholder="React" />
              </div>
              <div className="form-group">
                <label className="label">Niveau</label>
                <select {...register(`skills.${index}.level`)} className="input">
                  <option value="">Sélectionner</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => skillsFields.remove(index)}
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => skillsFields.append({ name: "", level: "" })}
        >
          <FiPlus /> Ajouter une compétence
        </button>
      </SectionCard>

      {/* Langues */}
      <SectionCard title="Langues" icon={<FiGlobe size={18} />}>
        {languagesFields.fields.map((field, index) => (
          <div key={field.id} className="dynamic-item inline-item">
            <div className="form-row">
              <div className="form-group">
                <label className="label">Langue</label>
                <input {...register(`languages.${index}.name`)} className="input" placeholder="Français" />
              </div>
              <div className="form-group">
                <label className="label">Niveau</label>
                <select {...register(`languages.${index}.level`)} className="input">
                  <option value="">Sélectionner</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Courant">Courant</option>
                  <option value="Natif">Natif</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => languagesFields.remove(index)}
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => languagesFields.append({ name: "", level: "" })}
        >
          <FiPlus /> Ajouter une langue
        </button>
      </SectionCard>

      {/* CV */}
      <SectionCard title="CV" icon={<FiUpload size={18} />}>
        <FileUpload
          onUpload={handleCVUpload}
          // eslint-disable-next-line react-hooks/incompatible-library
          currentFile={watch("cv.fileName")}
          accept=".pdf,.doc,.docx"
          maxSize={5 * 1024 * 1024}
        />
      </SectionCard>

      {/* Liens sociaux */}
      <SectionCard title="Liens sociaux" icon={<FiLink size={18} />}>
        <div className="form-group">
          <label className="label">LinkedIn</label>
          <input {...register("socialLinks.linkedin")} className="input" placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="form-group">
          <label className="label">GitHub</label>
          <input {...register("socialLinks.github")} className="input" placeholder="https://github.com/..." />
        </div>
        <div className="form-group">
          <label className="label">Portfolio</label>
          <input {...register("socialLinks.portfolio")} className="input" placeholder="https://..." />
        </div>
      </SectionCard>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Chargement..." : isRegistering ? "Créer mon compte" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditor;