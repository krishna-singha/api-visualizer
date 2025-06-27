import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

export interface ApiData {
  id: string;
  method: string;
  fullUrl: string;
  route: string;
  queryParams: Record<string, string>;
  params?: Record<string, string>;
  timestamp: number;
  timestampString: string;
  duration: number;
  size: {
    request: number;
    response: number;
    total: number;
  };
  status: number;
  request: {
    headers: Record<string, string>;
    body: any;
    rawBodyBase64?: string;
    contentType: string;
    charset: string | null;
    bodyType:
      | "json"
      | "form-data"
      | "urlencoded"
      | "text"
      | "binary"
      | "graphql"
      | "unknown";
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: any;
    contentType: string;
    charset: string | null;
    cookies: string[];
    redirectedTo?: string | null;
    encoding?: string | null;
    isCompressed: boolean;
    cacheControl?: string | null;
    etag?: string | null;
  };
  authorization: {
    hasAuthHeader: boolean;
    authType: string | null;
    parsed?: {
      username?: string;
      password?: string;
      token?: string;
      [key: string]: any;
    } | null;
  };
  meta: {
    ip: string;
    clientPort?: number;
    userAgent: string;
    referer?: string | null;
    origin?: string | null;
    acceptLanguage?: string | null;
    host: string;
    protocol: string;
    httpVersion: string;
    isKeepAlive?: boolean;
  };
}

interface SocketContextType {
  connectionStatus: boolean;
  data: ApiData[];
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [data, setData] = useState<ApiData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.apiKey) return;

    const clientId = user.apiKey;
    const wsBase = import.meta.env.VITE_WS_SERVER_URL;
    const socket = new WebSocket(`${wsBase}/frontend?clientId=${clientId}`);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setWs(socket);
      setConnectionStatus(true);
    };

    socket.onmessage = async (event) => {
      try {
        const rawText =
          typeof event.data === "string" ? event.data : await event.data.text();
        const payload = JSON.parse(rawText);

        const contentType = payload.request?.contentType || "";
        const responseContentType = payload.response?.contentType || "";
        const bodyType = determineBodyType(payload.request?.method, contentType);
        const url = new URL(payload.request?.path || "/", `http://${payload.meta?.host || "localhost"}`);

        const apiData: ApiData = {
          id: crypto.randomUUID(),
          method: payload.request?.method || "UNKNOWN",
          fullUrl: url.href,
          route: url.pathname,
          queryParams: Object.fromEntries(url.searchParams.entries()),
          params: payload.request?.params || {},
          timestamp: Date.now(),
          timestampString: new Date().toLocaleString(),
          duration: payload.meta?.durationMs || 0,
          size: {
            request: payload.request?.size || 0,
            response: payload.response?.size || 0,
            total: payload.meta?.totalSize || 0,
          },
          status: payload.response?.status || 0,
          request: {
            headers: payload.request?.headers || {},
            body: payload.request?.body || null,
            rawBodyBase64: payload.request?.rawBodyBase64 || undefined,
            contentType,
            charset: payload.request?.charset || null,
            bodyType,
          },
          response: {
            status: payload.response?.status || 0,
            headers: payload.response?.headers || {},
            body: tryParseJson(payload.response?.body),
            contentType: responseContentType,
            charset: payload.response?.charset || null,
            cookies: payload.response?.setCookies || [],
            redirectedTo: payload.response?.redirectedTo || null,
            encoding: payload.response?.encoding || null,
            isCompressed: !!payload.response?.isCompressed,
            cacheControl: payload.response?.cacheControl || null,
            etag: payload.response?.etag || null,
          },
          authorization: {
            hasAuthHeader: !!payload.authorization?.hasAuthHeader,
            authType: payload.authorization?.authType || null,
            parsed: payload.authorization?.parsed || null,
          },
          meta: {
            ip: payload.meta?.ip || "",
            clientPort: payload.meta?.clientPort || undefined,
            userAgent: payload.meta?.userAgent || "",
            referer: payload.meta?.referer || null,
            origin: payload.meta?.origin || null,
            acceptLanguage: payload.meta?.acceptLanguage || null,
            host: payload.meta?.host || "localhost",
            protocol: payload.meta?.protocol || "http",
            httpVersion: payload.meta?.httpVersion || "1.1",
            isKeepAlive: payload.meta?.isKeepAlive || false,
          },
        };

        setData((prev) => [apiData, ...prev]);

        await axios.post("/api/request-log/add", {
          uid: user.uid,
          apiData: apiData,
        });
      } catch (e) {
        console.warn("❌ Invalid WebSocket payload:", event.data);
      }
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setConnectionStatus(false);
    };

    socket.onerror = () => {
      console.error("⚠️ WebSocket error");
      setConnectionStatus(false);
    };

    setWs(socket);

    return () => {
      socket.close();
      console.log("🧼 WebSocket connection closed");
    };
  }, [user?.apiKey]);

  return (
    <SocketContext.Provider value={{ connectionStatus, data }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

function tryParseJson(data: any) {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return data;
  }
}

function determineBodyType(
  method: string,
  contentType: string
): ApiData["request"]["bodyType"] {
  if (method === "GET") return "unknown";
  if (contentType.includes("application/json")) return "json";
  if (contentType.includes("multipart/form-data")) return "form-data";
  if (contentType.includes("application/x-www-form-urlencoded")) return "urlencoded";
  if (contentType.includes("application/graphql")) return "graphql";
  if (contentType.includes("application/octet-stream")) return "binary";
  if (contentType.includes("text/")) return "text";
  return "unknown";
}