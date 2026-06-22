import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title:       { type: String, required: [true, "Titre requis"], trim: true },
    description: { type: String, default: "" },
    companyName: { type: String, default: "" },
    companyId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    domain:      { type: String, default: "" },
    location:    { type: String, default: "" },
    duration:    { type: String, default: "" },
    type:        { type: String, enum: ["stage", "PFE", "alternance", "formation", "vidéo"], default: "stage" },
    skills:      [{ type: String }],
    salary:      { type: Number, default: 0 },
    deadline:    { type: Date },
    isActive:    { type: Boolean, default: true },
    views:       { type: Number, default: 0 },
    nbrInterns:  { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
