import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nom requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    password: {
      type: String,
      required: [true, "Mot de passe requis"],
      minlength: [6, "Minimum 6 caractères"],
      select: false,
    },
    role: {
      type: String,
      enum: ["étudiant", "entreprise", "encadrant", "admin"],
      default: "étudiant",
    },
    phone:      { type: String, default: "" },
    university: { type: String, default: "" },
    specialty:  { type: String, default: "" },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    supervisorName: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hachage du mot de passe avant sauvegarde
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Comparer le mot de passe lors de la connexion
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exclure le mot de passe des réponses JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
