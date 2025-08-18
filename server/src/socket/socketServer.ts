import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

interface ClientConnection {
  frontend?: Socket;
  agent?: Socket;
}

interface ClientMap {
  [apiKey: string]: ClientConnection;
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
    const { apiKey, type } = socket.handshake.query as {
      apiKey?: string;
      type?: "frontend" | "agent";
    };

    if (!apiKey || !type) {
      // console.warn("Missing apiKey or type in connection query");
      return socket.disconnect();
    }

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
        //   console.warn(`⚠️ No frontend connected for apiKey: ${apiKey}`);
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
