import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Offer from "./models/offers.model.js";

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connecté à MongoDB");

  const offers = await Offer.find({});
  console.log(`📦 ${offers.length} offres trouvées`);

  let updated = 0;

  for (const offer of offers) {
    const obj = offer.toObject();
    let needsUpdate = false;
    const updates = {};

    // Migration company → companyName
    if (!obj.companyName && obj.company) {
      updates.companyName = obj.company;
      needsUpdate = true;
    }

    // Migration desc → description
    if (!obj.description && obj.desc) {
      updates.description = obj.desc;
      needsUpdate = true;
    }

    // Migration motsCles → skills
    if ((!obj.skills || obj.skills.length === 0) && obj.motsCles?.length) {
      updates.skills = obj.motsCles;
      needsUpdate = true;
    }

    // Migration specialite → domain
    if (!obj.domain && obj.specialite) {
      updates.domain = obj.specialite;
      needsUpdate = true;
    }

    // Normaliser le type (Stage/PFE → stage/PFE/alternance)
    if (obj.type && !["stage", "PFE", "alternance"].includes(obj.type)) {
      updates.type = obj.type.toLowerCase() === "stage" ? "stage" : obj.type;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await Offer.updateOne({ _id: obj._id }, { $set: updates });
      updated++;
      console.log(`  ✓ Migré: ${obj.title}`);
    }
  }

  console.log(`\n✅ Migration terminée — ${updated} offres mises à jour`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Erreur migration:", err);
  process.exit(1);
});
