import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { connectMongoDB } from "./connections/mongoDB";
import userRouter from "./routers/userRouter";
import apiKeyRouter from "./routers/apiKeyRouter";
import requestLogsRouter from "./routers/requestLogsRouter";
import { setupTunnelServer } from "./socket/socketServer";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Create a raw HTTP server from Express app
const server = http.createServer(app);

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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
  // console.log("Received test request:", req.body);
  res.status(200).json({ message: "Test successful", data: req.body });
});

app.use("/api/users", userRouter);
app.use("/api/key", apiKeyRouter);
app.use("/api/request-log", requestLogsRouter);

// Attach the tunnel WebSocket server
setupTunnelServer(server);

// Start server
connectMongoDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running`);
  });
});
