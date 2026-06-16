import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    offerId:   { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status:    { type: String, enum: ["en attente", "acceptée", "refusée", "en cours"], default: "en attente" },
    coverLetter: { type: String, default: "" },
    cvUrl:       { type: String, default: "" },
    note:        { type: String, default: "" },
  },
  { timestamps: true }
);

applicationSchema.index({ offerId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
