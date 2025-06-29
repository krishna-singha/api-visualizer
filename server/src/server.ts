import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongoDB } from "./connections/mongoDB";
import userRouter from "./routers/userRouter";
import apiKeyRouter from "./routers/apiKeyRouter";
import requestLogsRouter from "./routers/requestLogsRouter";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(
  cors({
    // origin: process.env.FRONTEND_URL,
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (_req, res) => {
  res.status(200).json({ message: "API is running" });
});
app.post("/", (req, res) => {
  console.log("Received test request:", req.body);
  res.status(200).json({ message: "Test successful", data: req.body });
});
app.use("/api/users", userRouter);
app.use("/api/key", apiKeyRouter);
app.use("/api/request-log", requestLogsRouter);

// Start
connectMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
