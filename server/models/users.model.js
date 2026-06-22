import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const experienceSchema = new mongoose.Schema({
  company:      { type: String, default: "" },
  position:     { type: String, default: "" },
  location:     { type: String, default: "" },
  startDate:    { type: Date },
  endDate:      { type: Date },
  current:      { type: Boolean, default: false },
  description:  { type: String, default: "" },
  technologies: [{ type: String }],
}, { _id: false });

const skillSchema = new mongoose.Schema({
  name:     { type: String, default: "" },
  level:    { type: String, enum: ["Débutant", "Intermédiaire", "Avancé", "Expert"], default: "Débutant" },
  category: { type: String, default: "" },
}, { _id: false });

const languageSchema = new mongoose.Schema({
  name:  { type: String, default: "" },
  level: { type: String, enum: ["Débutant", "Intermédiaire", "Courant", "Natif"], default: "Débutant" },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, "Nom requis"], trim: true },
    email:    { type: String, required: [true, "Email requis"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Mot de passe requis"], minlength: 6, select: false },
    role:     { type: String, enum: ["étudiant", "entreprise", "encadrant", "admin"], default: "étudiant" },
    phone:          { type: String, default: "" },
    university:     { type: String, default: "" },
    specialty:      { type: String, default: "" },
    supervisorId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    supervisorName: { type: String, default: "" },
    isActive:       { type: Boolean, default: true },
    favorites:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Offer" }],

    // Champs profil étudiant
    bio:        { type: String, default: "" },
    education: {
      institution:  { type: String, default: "" },
      degree:       { type: String, default: "" },
      fieldOfStudy: { type: String, default: "" },
      startDate:    { type: Date },
      endDate:      { type: Date },
      current:      { type: Boolean, default: false },
      grade:        { type: String, default: "" },
      courses:      [{ type: String }],
    },
    experience:  [experienceSchema],
    skills:      [skillSchema],
    languages:   [languageSchema],
    socialLinks: {
      linkedin:  { type: String, default: "" },
      github:    { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
