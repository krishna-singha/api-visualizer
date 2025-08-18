import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import { connectMongoDB } from "./connections/mongoDB";
import userRouter from "./routers/userRouter";
import apiKeyRouter from "./routers/apiKeyRouter";
import requestLogsRouter from "./routers/requestLogsRouter";
import { setupTunnelServer } from "./socket/socketServer";
import { accessControlMiddleware } from "./middleware/accessControl";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// EJS config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

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
app.use(accessControlMiddleware);

// Routes
app.get("/", (_req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Ping page as EJS
app.get("/ping", (_req, res) => {
  res.status(200).render("ping", { FRONTEND_URL: process.env.FRONTEND_URL });
});

app.use("/api/users", userRouter);
app.use("/api/key", apiKeyRouter);
app.use("/api/request-log", requestLogsRouter);

// Attach the tunnel WebSocket server
setupTunnelServer(server);

// Start server
connectMongoDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
