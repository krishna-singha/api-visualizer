import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import path from "path";
import { connectMongoDB } from "./connections/mongoDB";
import apiKeyRouter from "./routers/apiKeyRouter";
import requestLogsRouter from "./routers/requestLogsRouter";
import { setupTunnelServer } from "./socket/socketServer";
import { accessControlMiddleware } from "./middleware/accessControl";

dotenv.config();

if (!process.env.FRONTEND_URL) {
  console.error("FRONTEND_URL is not set");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8000;

// Render puts one proxy in front
app.set("trust proxy", 1);

// EJS config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

// Create a raw HTTP server from Express app
const server = http.createServer(app);

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
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

// Per-IP limits
const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false });
const keyWriteLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });

app.use("/api", apiLimiter);
app.post("/api/key/add", keyWriteLimiter);
app.put("/api/key/update", keyWriteLimiter);
app.use("/api/key", apiKeyRouter);
app.use("/api/request-log", requestLogsRouter);

// Attach the tunnel WebSocket server
setupTunnelServer(server);

// Start server
connectMongoDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(() => process.exit(1));
