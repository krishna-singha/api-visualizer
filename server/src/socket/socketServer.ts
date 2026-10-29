import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import User from "../models/User";
import { isValidApiKeyFormat } from "../utils/apiKey";

interface ClientConnection {
  frontends: Set<Socket>;
  agents: Set<Socket>;
}

interface ClientMap {
  [apiKey: string]: ClientConnection;
}

export const clients: ClientMap = {};

const authError = (code: string, message: string) => Object.assign(new Error(message), { data: { code } });

export const revokeApiKey = (apiKey: string) => {
  const conn = clients[apiKey];
  if (!conn) return;
  [...conn.frontends, ...conn.agents].forEach((socket) => {
    socket.emit("auth_error", { code: "KEY_REVOKED" });
    socket.disconnect(true);
  });
};


export const setupTunnelServer = (server: HttpServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Validate apiKey + type before connection is accepted
  io.use(async (socket, next) => {
    const apiKey = socket.handshake.auth?.apiKey ?? socket.handshake.query.apiKey;
    const type = socket.handshake.query.type;

    // Strict format check also blocks object payloads
    if (!isValidApiKeyFormat(apiKey)) {
      return next(authError("INVALID_KEY_FORMAT", "Invalid API key format"));
    }
    if (type !== "frontend" && type !== "agent") {
      return next(new Error("Invalid connection type"));
    }

    try {
      if (!(await User.exists({ apiKey }))) return next(authError("KEY_NOT_FOUND", "API key not found"));
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

    // conn stays in map while any socket of this key is connected
    const conn = (clients[apiKey] ||= { frontends: new Set(), agents: new Set() });

    if (type === "frontend") {
      conn.frontends.add(socket);
      // console.log(`Frontend connected [${apiKey}]`);

    } else if (type === "agent") {
      conn.agents.add(socket);
      // console.log(`Agent connected [${apiKey}]`);

      socket.on("log", (payload: any) => {
        // Forward only the encrypted string, drop anything else
        if (typeof payload?.data !== "string") return;
        conn.frontends.forEach((frontend) => frontend.emit("log", { data: payload.data }));
      });
    }

    socket.on("disconnect", () => {
      // console.log(`${type} disconnected [${apiKey}]`);

      conn.frontends.delete(socket);
      conn.agents.delete(socket);

      if (!conn.frontends.size && !conn.agents.size) {
        delete clients[apiKey];
        // console.log(`Cleaned up clients[${apiKey}]`);
      }
    });
  });
};
