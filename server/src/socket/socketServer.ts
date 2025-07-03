import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

interface ClientMap {
  [apiKey: string]: {
    frontend?: Socket;
    agent?: Socket;
  };
}

export const clients: ClientMap = {};

export const setupTunnelServer = (server: HttpServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const { apiKey, type } = socket.handshake.query as { apiKey?: string; type?: string };
    if (!apiKey || !type) return socket.disconnect();

    const conn = clients[apiKey] ||= {};

    if (type === "frontend") {
      conn.frontend = socket;
      console.log("✅ Frontend connected:", apiKey);
    } else if (type === "agent") {
      conn.agent = socket;
      console.log("✅ Agent connected:", apiKey);

      socket.on("log", (payload) => {
        if (conn.frontend?.connected) {
          conn.frontend.emit("log", payload); // 👈 relay to frontend
        }
      });
    }

    socket.on("disconnect", () => {
      if (conn.frontend === socket) conn.frontend = undefined;
      if (conn.agent === socket) conn.agent = undefined;
      if (!conn.frontend && !conn.agent) delete clients[apiKey];
    });
  });
};
