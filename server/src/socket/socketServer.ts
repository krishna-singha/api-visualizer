import { IncomingMessage, Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { URL } from "url";
import { Socket } from "net";

interface ClientMap {
  [apiKey: string]: {
    frontend?: WebSocket;
    agent?: WebSocket;
  };
}

export const clients: ClientMap = {};

export const setupTunnelServer = (server: HttpServer) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || "/", "http://localhost");
    const path = url.pathname.toLowerCase();
    const apiKey = url.searchParams.get("apiKey");

    if (!apiKey) {
      ws.close();
      return;
    }

    if (!clients[apiKey]) clients[apiKey] = {};
    const conn = clients[apiKey];

    if (path.includes("frontend")) {
      conn.frontend = ws;
      // console.log(`Frontend connected: ${apiKey}`);
    } else if (path.includes("agent") || path === "/" || path === "") {
      conn.agent = ws;
      // console.log(`Agent connected: ${apiKey}`);
    } else {
      // console.warn(`Unknown WebSocket path: ${path}`);
      return ws.close();
    }

    ws.on("message", (msg) => {
      if (ws === conn.agent && conn.frontend?.readyState === WebSocket.OPEN) {
        conn.frontend.send(msg);
      }
    });

    ws.on("close", () => {
      if (ws === conn.frontend) conn.frontend = undefined;
      if (ws === conn.agent) conn.agent = undefined;

      if (!conn.frontend && !conn.agent) {
        delete clients[apiKey];
        // console.log(`Cleaned up apiKey: ${apiKey}`);
      }
    });
  });

};
