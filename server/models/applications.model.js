import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Application Model
 * Représente une candidature d'un étudiant à une offre de stage.
 * Conçu pour : suivi du statut, pièces jointes, feedback et entretien.
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

    studentName: { type: String, default: "", trim: true },
    studentEmail: { type: String, default: "", trim: true },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Entreprise requise"],
      index: true,
    },

    companyName: { type: String, default: "", trim: true },

    coverLetter: { type: String, default: "", trim: true, maxlength: [5000, "Lettre de motivation trop longue"] },
    resumeUrl: { type: String, default: "", trim: true },

    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "under_review", "shortlisted", "interview", "accepted", "rejected", "withdrawn"],
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

// Empêcher qu'un étudiant postule plusieurs fois à la même offre
applicationSchema.index({ offerId: 1, studentId: 1 }, { unique: true });

applicationSchema.virtual("appliedAt").get(function () {
  return this.createdAt;
});

applicationSchema.methods.updateStatus = function (newStatus, opts = {}) {
  const allowed = ["pending", "under_review", "shortlisted", "interview", "accepted", "rejected", "withdrawn"];
  if (!allowed.includes(newStatus)) throw new Error("Statut invalide");
  this.status = newStatus;
  if (opts.feedback) this.feedback = opts.feedback;
  if (typeof opts.viewedByCompany === "boolean") this.viewedByCompany = opts.viewedByCompany;
  if (typeof opts.viewedByApplicant === "boolean") this.viewedByApplicant = opts.viewedByApplicant;
  return this.save();
};

applicationSchema.methods.markViewedByCompany = function () {
  this.viewedByCompany = true;
  return this.save();
};

applicationSchema.methods.markViewedByApplicant = function () {
  this.viewedByApplicant = true;
  return this.save();
};

applicationSchema.statics.findByOffer = function (offerId, filter = {}) {
  return this.find({ offerId, ...filter });
};

applicationSchema.statics.findByStudent = function (studentId, filter = {}) {
  return this.find({ studentId, ...filter });
};

export default mongoose.model("Application", applicationSchema);
