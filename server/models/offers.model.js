import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Offer Model
 * Représente une offre de stage créée par une entreprise.
 * Utilisée par : Entreprise (création) et Étudiant (consultation, candidature).
 */
const offerSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Titre requis"],
      trim: true,
      minlength: [3, "Titre trop court"],
      maxlength: [140, "Titre trop long"],
    },

    description: {
      type: String,
      required: [true, "Description requise"],
      trim: true,
      minlength: [10, "Description trop courte"],
      maxlength: [5000, "Description trop longue"],
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

    domain: {
      type: String,
      required: [true, "Domaine requis"],
      trim: true,
      index: true,
    },

    specialty: {
      type: String,
      default: "",
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["stage_ouvrier", "stage_technicien", "stage_pfe", "stage_initiation"],
      default: "stage_pfe",
    },

    status: {
      type: String,
      enum: ["active", "closed", "expired"],
      default: "active",
      index: true,
    },

    deadline: {
      type: Date,
      default: null,
    },

    numberOfPlaces: {
      type: Number,
      default: 1,
      min: [1, "Au moins une place requise"],
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

// Text index pour recherche full-text sur les offres
offerSchema.index({ title: "text", description: "text", skills: "text", companyName: "text", domain: "text", specialty: "text" });

// Virtual property pour savoir si l'offre est expirée
offerSchema.virtual("isExpired").get(function () {
  if (!this.deadline) return false;
  return this.deadline < new Date();
});

// Pré-save: garantir des valeurs cohérentes
offerSchema.pre("save", function (next) {
  if (this.numberOfPlaces < 1) this.numberOfPlaces = 1;
  if (this.deadline && this.deadline < new Date()) {
    this.status = "expired";
  }
  next();
});

// Instance method pour fermer l'offre
offerSchema.methods.markClosed = function () {
  this.status = "closed";
  return this.save();
};

// Static helper pour récupérer les offres actives
offerSchema.statics.findActive = function (filter = {}) {
  const now = new Date();
  return this.find({
    status: "active",
    $or: [{ deadline: { $gte: now } }, { deadline: null }],
    ...filter,
  });
};

export default mongoose.model("Offer", offerSchema);