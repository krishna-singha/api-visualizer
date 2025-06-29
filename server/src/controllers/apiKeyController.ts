import { Request, Response } from "express";
import User from "../models/User";
import crypto from "crypto";

export const fetchApiKey = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        status: false,
        error: "UID is required.",
      });
    }

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found.",
      });
    }

    return res.status(200).json({
      status: true,
      apiKey: user.apiKey,
      apiCreatedAt: user.apiCreatedAt,
    });
  } catch (error) {
    console.error("❌ Error fetch APi Key:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};

// Generate a unique 64-character API key
const generateUniqueApiKey = async (): Promise<string> => {
  let key: string;
  let existing;
  do {
    key = crypto.randomBytes(32).toString("hex");
    existing = await User.findOne({ apiKey: key });
  } while (existing);
  return key;
};

// Add new user with API key
export const addApiKeyToDB = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, uid, email, photoURL } = req.body;

    if (!name || !uid || !email) {
      return res.status(400).json({
        status: false,
        error: "Name, UID, and email are required.",
      });
    }

    const exists = await User.exists({ uid });
    if (exists) {
      return res.status(400).json({
        status: false,
        message: "User already exists.",
      });
    }

    const apiKey = await generateUniqueApiKey();

    const user = new User({
      name,
      uid,
      email,
      photoURL: photoURL || null,
      apiKey,
      apiCreatedAt: new Date().toISOString(),
    });

    await user.save();

    return res.status(201).json({
      status: true,
      message: "User and API key created successfully.",
      apiKey,
      apiCreatedAt: user.apiCreatedAt,
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};

// Regenerate API key for existing user
export const updateApiKey = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        status: false,
        error: "UID is required.",
      });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found.",
      });
    }

    const newApiKey = await generateUniqueApiKey();
    const newCreatedAt = new Date().toISOString();

    user.apiKey = newApiKey;
    user.apiCreatedAt = newCreatedAt;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "API key regenerated successfully.",
      apiKey: newApiKey,
      apiCreatedAt: newCreatedAt,
    });
  } catch (err) {
    console.error("❌ Error updating API key:", err);
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};
