import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import User from "../models/User";

interface ClientConnection {
  frontend?: Socket;
  agent?: Socket;
}

interface ClientMap {
  [apiKey: string]: ClientConnection;
}

export const clients: ClientMap = {};

const API_KEY_REGEX = /^[a-f0-9]{64}$/;

export const setupTunnelServer = (server: HttpServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    },
  });

  // Validate apiKey + type before connection is accepted
  io.use(async (socket, next) => {
    const apiKey = socket.handshake.auth?.apiKey ?? socket.handshake.query.apiKey;
    const type = socket.handshake.query.type;

    // Strict format check also blocks object payloads
    if (typeof apiKey !== "string" || !API_KEY_REGEX.test(apiKey)) {
      return next(new Error("Invalid API key"));
    }
    if (type !== "frontend" && type !== "agent") {
      return next(new Error("Invalid connection type"));
    }

    try {
      if (!(await User.exists({ apiKey }))) return next(new Error("Invalid API key"));
    } catch {
      return next(new Error("Server error"));
    }

    socket.data.apiKey = apiKey;
    socket.data.type = type;
    next();
  });

  io.on("connection", (socket) => {
    const { apiKey, type } = socket.data as {
      apiKey: string;
      type: "frontend" | "agent";
    };

    const conn = (clients[apiKey] ||= {});

    if (type === "frontend") {
      conn.frontend = socket;
      // console.log(`Frontend connected [${apiKey}]`);

    } else if (type === "agent") {
      conn.agent = socket;
      // console.log(`Agent connected [${apiKey}]`);

      socket.on("log", (payload: any) => {
        if (conn.frontend?.connected) {
          try {
            conn.frontend.emit("log", payload);
          } catch (err) {
            console.error("Failed to forward log");
          }
        } 
        // else {
        //   console.warn(`No frontend connected for apiKey: ${apiKey}`);
        // }
      });
    }

    socket.on("disconnect", () => {
      // console.log(`${type} disconnected [${apiKey}]`);

      if (conn.frontend === socket) conn.frontend = undefined;
      if (conn.agent === socket) conn.agent = undefined;

      if (!conn.frontend && !conn.agent) {
        delete clients[apiKey];
        // console.log(`Cleaned up clients[${apiKey}]`);
      }
    });
  });
};
