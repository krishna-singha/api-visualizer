import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String, default: null },
    apiKey: { type: String, required: true, unique: true },
    apiCreatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
