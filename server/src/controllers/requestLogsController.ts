import RequestLogs from "../models/RequestLogs";
import User from "../models/User";
import { Request, Response } from "express";

const MAX_LOGS = 50;
const MAX_LOG_SIZE = 250 * 1024;

// To add request log in database
export const addRequestLogs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { uid, apiData } = req.body;

    if (typeof uid !== "string" || !uid || !apiData || typeof apiData !== "object") {
      return res.status(400).json({
        status: false,
        error: "uid and apiData are required.",
      });
    }

    if (Buffer.byteLength(JSON.stringify(apiData)) > MAX_LOG_SIZE) {
      return res.status(413).json({
        status: false,
        error: "Request log too large.",
      });
    }

    const user = await User.exists({ uid });
    if (!user) {
      return res.status(400).json({
        status: false,
        error: "User not registered to this platform.",
      });
    }

    await RequestLogs.updateOne(
      { uid },
      { $push: { requests: { $each: [apiData], $slice: -MAX_LOGS } } },
      { upsert: true }
    );

    return res.status(201).json({
      status: true,
      message: "Request log added successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};

// TO fetch request logs from database
export const fetchRequestLogs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        status: false,
        error: "uid required.",
      });
    }

    // No logs yet is not an error
    const logs = await RequestLogs.findOne({ uid });

    return res.status(200).json({
      status: true,
      data: logs?.requests || [],
      message: "Request log found.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};

// To clear all request logs of a user
export const clearRequestLogs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        status: false,
        error: "uid required.",
      });
    }

    await RequestLogs.updateOne({ uid }, { $set: { requests: [] } });

    return res.status(200).json({
      status: true,
      message: "Request logs cleared successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: "Internal server error.",
    });
  }
};
