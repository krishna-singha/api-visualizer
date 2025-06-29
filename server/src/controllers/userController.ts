import { Request, Response } from "express";
import User from "../models/User";


// Add a user to the database
export const addUserToDatabase = async (req: Request, res: Response): Promise<any> => {
  const { name, uid, email, photoURL } = req.body;

  if (!name || !uid || !email) {
    return res.status(400).json({
      status: false,
      error: "All fields are required.",
    });
  }

  try {
    const user = await User.findOne({ uid });
    if (user) {
      return res.status(200).json({
        status: false,
        message: "User already exists.",
      });
    }
    // Create a new user instance
    const newUser = new User({
      name,
      uid,
      email,
      photoURL: photoURL || null,
    });
    await newUser.save();

    return res.status(201).json({
      status: true,
      message: "User added successfully.",
    });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};

// Get a user from the database by UID
export const getUserFromDatabase = async (req: Request, res: Response): Promise<any> => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({
      status: false,
      error: "UID is required.",
    });
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found.",
      });
    }

    return res.status(200).json({
      status: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};

