import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Application Model
 * Représente une candidature d'un étudiant à une offre de stage.
 * Rôle rapide: permet à un étudiant de postuler et à une entreprise
 * de suivre / gérer les candidatures (statuts, notes, entretien).
 *
 * Index unique sur (offerId, studentId) pour empêcher les doublons.
 */
const applicationSchema = new Schema(
  {
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: [true, "Offre requise"],
      index: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Étudiant requis"],
      index: true,
    },

    studentName: {
      type: String,
      default: "",
      trim: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Entreprise requise"],
      index: true,
    },

    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    coverLetter: {
      type: String,
      default: "",
      trim: true,
      maxlength: [5000, "Lettre de motivation trop longue"],
    },

    resumeUrl: {
      type: String,
      default: "",
      trim: true,
      match: [/^$|^(https?:\/\/\S+)$/, "URL de CV invalide"],
    },

    status: {
      type: String,
      enum: ["pending", "under_review", "shortlisted", "rejected", "accepted", "withdrawn"],
      default: "pending",
      index: true,
    },

    viewed: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    interviewDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Empêcher qu'un étudiant postule plusieurs fois à la même offre
applicationSchema.index({ offerId: 1, studentId: 1 }, { unique: true });

// Virtual pour savoir si la candidature est active (non rejetée/retirée)
applicationSchema.virtual("isActive").get(function () {
  return ["pending", "under_review", "shortlisted"].includes(this.status);
});

// Méthode d'instance pour mettre à jour le statut en respectant l'enum
applicationSchema.methods.updateStatus = async function (newStatus) {
  const allowed = ["pending", "under_review", "shortlisted", "rejected", "accepted", "withdrawn"];
  if (!allowed.includes(newStatus)) throw new Error("Statut invalide");
  this.status = newStatus;
  return this.save();
};

applicationSchema.methods.markViewed = function () {
  this.viewed = true;
  return this.save();
};

// Helpers statics
applicationSchema.statics.findByOffer = function (offerId, filter = {}) {
  return this.find({ offerId, ...filter });
};

applicationSchema.statics.findByStudent = function (studentId, filter = {}) {
  return this.find({ studentId, ...filter });
};

export default mongoose.model("Application", applicationSchema);
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Application Model
 * Représente une candidature d'un étudiant à une offre de stage.
 * Rôle : stocker l'état de la candidature, pièces jointes, statut et métadonnées.
 */
const applicationSchema = new Schema(
  {
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: [true, "Offre requise"],
      index: true,
    },

    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidat requis"],
      index: true,
    },

    applicantName: { type: String, default: "", trim: true },
    applicantEmail: {
      type: String,
      default: "",
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Entreprise requise"],
      index: true,
    },

    resumeUrl: { type: String, default: "" },

    coverLetter: {
      type: String,
      default: "",
      trim: true,
      maxlength: [5000, "Lettre de motivation trop longue"],
    },

    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "under_review", "shortlisted", "interview", "rejected", "accepted", "withdrawn"],
      default: "pending",
      index: true,
    },

    feedback: { type: String, default: "", trim: true },

    viewedByCompany: { type: Boolean, default: false },
    viewedByApplicant: { type: Boolean, default: false },

    interview: {
      date: { type: Date, default: null },
      location: { type: String, default: "" },
      notes: { type: String, default: "" },
    },

    meta: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Empêche les doublons d'une même candidature pour une offre
applicationSchema.index({ offerId: 1, applicantId: 1 }, { unique: true });

applicationSchema.virtual("appliedAt").get(function () {
  return this.createdAt;
});

// Méthode d'instance pour mettre à jour le statut
applicationSchema.methods.updateStatus = function (newStatus, opts = {}) {
  this.status = newStatus;
  if (opts.feedback) this.feedback = opts.feedback;
  if (typeof opts.viewedByCompany === "boolean") this.viewedByCompany = opts.viewedByCompany;
  if (typeof opts.viewedByApplicant === "boolean") this.viewedByApplicant = opts.viewedByApplicant;
  return this.save();
};

// Statics utiles
applicationSchema.statics.findByOffer = function (offerId, filter = {}) {
  return this.find({ offerId, ...filter });
};

applicationSchema.statics.findByApplicant = function (applicantId, filter = {}) {
  return this.find({ applicantId, ...filter });
};

export default mongoose.model("Application", applicationSchema);
