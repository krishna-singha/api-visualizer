import RequestLogs from "../models/RequestLogs";
import User from "../models/User";
import { Request, Response } from "express";

// To add request log in database
export const addRequestLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const { uid, apiData } = req.body;

    if (!uid || !apiData) {
      return res.status(400).json({
        status: false,
        error: "uid and apiData are required.",
      });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(400).json({
        status: false,
        error: "User not registered to this platform.",
      });
    }

    const existing = await RequestLogs.findOne({ uid });
    

    if (!existing) {
      await RequestLogs.create({ uid, requests: [apiData] });
    } else {
      existing.requests.push(apiData);
      if (existing.requests.length > 50) {
        existing.requests.splice(0, existing.requests.length - 50);
      }
      await existing.save();
    }

    return res.status(201).json({
      status: true,
      message: "Request log added successfully.",
    });
  } catch (error) {
    console.error("❌ Error saving request logs:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};


// TO fetch request logs from database
export const fetchRequestLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        status: false,
        error: "uid required.",
      });
    }

    const user = await RequestLogs.findOne({ uid });
    if(!user){
      return res.status(400).json({
        status: false,
        error: "No Request log found",
      });
    }

    return res.status(201).json({
      status: true,
      data: user.requests,
      message: "Request log found.",
    });    

  }
  catch (error) {
    console.error("❌ Error saving request logs:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
}