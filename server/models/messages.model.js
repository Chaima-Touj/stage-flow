import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Message Model
 * Représente un échange entre utilisateurs (Étudiant, Entreprise, Encadrant).
 * Supporte conversation one-to-one et messages liés à une offre ou candidature.
 */
const messageSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Expéditeur requis"],
      index: true,
    },

    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Destinataire requis"],
      index: true,
    },

    offerId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
      index: true,
    },

    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      default: null,
      index: true,
    },

    subject: { type: String, default: "", trim: true },

    body: {
      type: String,
      required: [true, "Corps du message requis"],
      trim: true,
      maxlength: [5000, "Message trop long"],
    },

    attachments: [
      {
        filename: { type: String },
        url: { type: String },
      },
    ],

    read: { type: Boolean, default: false, index: true },

    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Index pour permettre recherche de conversation entre deux users
messageSchema.index({ from: 1, to: 1, createdAt: -1 });

// Virtual : conversationId (ordre indépendant)
messageSchema.virtual("conversationId").get(function () {
  const a = this.from.toString();
  const b = this.to.toString();
  return a < b ? `${a}_${b}` : `${b}_${a}`;
});

// Marquer comme lu
messageSchema.methods.markRead = function () {
  this.read = true;
  return this.save();
};

// Récupérer conversation
messageSchema.statics.threadBetween = function (userA, userB, limit = 50) {
  return this.find({
    $or: [
      { from: userA, to: userB },
      { from: userB, to: userA },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

export default mongoose.model("Message", messageSchema);
