import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/users.model.js";
import fs from "fs";

const users = JSON.parse(
  fs.readFileSync("./stageflow.users.json", "utf-8")
);

const MONGO_URI = "mongodb://127.0.0.1:27017/stageflow";

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    await User.deleteMany({});
    console.log("Old users removed");

    const formattedUsers = await Promise.all(
      users.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password, 10);

        return {
          ...u,
          password: hashedPassword
        };
      })
    );

    await User.insertMany(formattedUsers);

    console.log("Users seeded successfully 🚀");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();