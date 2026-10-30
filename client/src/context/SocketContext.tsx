import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { parseToApiData } from "../lib/parseToApiData";
import { waitForServer } from "../lib/waitForServer";
import type { ApiData } from "../lib/parseToApiData";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  connectionStatus: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  data: ApiData[];
  historyData: ApiData[];
  historyMode: boolean;
  connect: () => void;
  disconnect: () => void;
  clearHistory: () => void;
  clearAllData: () => void;
  setHistoryData: (data: ApiData[]) => void;
  setHistoryMode: (enabled: boolean) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

// Codes sent by server on handshake rejection / key regenerate
const AUTH_MESSAGES: Record<string, string> = {
  INVALID_KEY_FORMAT: "Invalid API key format. Reload the page.",
  KEY_NOT_FOUND: "API key not found. It may have been regenerated in another session. Reload the page.",
  KEY_REVOKED: "API key was regenerated in another session. Reload the page to use the new key.",
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, setShowTimeoutModal } = useAuth();
  const [data, setData] = useState<ApiData[]>([]);
  const [historyData, setHistoryData] = useState<ApiData[]>([]);
  const [historyMode, setHistoryModeState] = useState(() => {
    const saved = localStorage.getItem('history-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const wantConnectedRef = useRef(false);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);

  // Socket handlers read latest values, not the ones from connect time
  const userRef = useRef(user);
  const historyModeRef = useRef(historyMode);
  useEffect(() => {
    userRef.current = user;
    historyModeRef.current = historyMode;
  });

  // Custom setter that also updates localStorage
  const setHistoryMode = (enabled: boolean) => {
    setHistoryModeState(enabled);
    localStorage.setItem('history-mode', JSON.stringify(enabled));
  };

  const clearHistory = () => {
    setHistoryData([]);
  };

  const clearAllData = () => {
    setHistoryData([]);
    setData([]);
  };

  // Clear history data when history mode is disabled
  useEffect(() => {
    if (!historyMode) {
      setHistoryData([]);
    }
  }, [historyMode]);

  // Connect to the socket
  const connect = async () => {
    if (!userRef.current?.apiKey || socketRef.current) return;

    wantConnectedRef.current = true;
    setConnectionError(null);
    const attempt = ++attemptRef.current;
    const isCurrent = () => attempt === attemptRef.current;
    setIsConnecting(true);

    // Wait for server
    const awake = await waitForServer(setShowTimeoutModal);
    if (!isCurrent() || socketRef.current) return;

    // Read key after waiting
    const apiKey = userRef.current?.apiKey;
    if (!awake || !apiKey) {
      setIsConnecting(false);
      return;
    }

    // Clear any existing timeout
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }

    connectTimeoutRef.current = setTimeout(() => {
      setIsConnecting(false);
      console.warn("Socket connection timeout - taking longer than expected");
    }, 10000);

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { apiKey },
      query: { type: "frontend" },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      setConnectionStatus(true);
      setIsConnecting(false);
      setConnectionError(null);
    });

    socket.on("disconnect", () => {
      setConnectionStatus(false);
      setIsConnecting(false);

      // Server-side disconnect
      if (!socket.active && socketRef.current === socket) socketRef.current = null;
    });

    socket.on("connect_error", (err) => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      setIsConnecting(false);
      console.error("Socket.IO connection error:", err.message);

      const code = (err as Error & { data?: { code?: string } }).data?.code;
      setConnectionError((code && AUTH_MESSAGES[code]) || "Can't reach the server. Retrying...");

      // Server rejected handshake
      if (!socket.active && socketRef.current === socket) socketRef.current = null;
    });

    // Key regenerated elsewhere
    socket.on("auth_error", ({ code }: { code: string }) => {
      // Ignore if this tab already reconnected with the new key
      if (socketRef.current === socket) setConnectionError(AUTH_MESSAGES[code] || code);
    });

    socket.on("log", async (payload: { data: string }) => {
      try {
        // Decrypt with the key this socket was opened with
        const decrypted = await decryptJSON(payload.data, apiKey);
        const apiData = parseToApiData(decrypted);
        setData((prev) => [apiData, ...prev]);

        const uid = userRef.current?.uid;
        if (historyModeRef.current && uid) {
          await axios.post("/api/request-log/add", { uid, apiData });
        }
      } catch {
        console.warn("Invalid payload:", payload);
      }
    });

    socketRef.current = socket;
  };

  const disconnect = () => {
    wantConnectedRef.current = false;
    attemptRef.current++;
    setIsConnecting(false);
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnectionStatus(false);
    // console.log("Manually disconnected from API Visualizer");
  };

  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }
      disconnect();
    };
  }, []);

  // Reconnect with new key after regenerate; drop socket on logout
  const apiKey = user?.apiKey;
  useEffect(() => {
    if (!wantConnectedRef.current) return;
    disconnect();
    if (apiKey) connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  return (
    <SocketContext.Provider
      value={{
        connectionStatus,
        isConnecting,
        connectionError,
        data,
        historyData,
        historyMode,
        connect,
        disconnect,
        clearHistory,
        clearAllData,
        setHistoryData,
        setHistoryMode,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

async function decryptJSON(encrypted: string, secret: string): Promise<unknown> {
  const [ivB64, authTagB64, cipherB64] = encrypted.split(":");

  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const authTag = Uint8Array.from(atob(authTagB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));

  const dataWithAuthTag = new Uint8Array(ciphertext.length + authTag.length);
  dataWithAuthTag.set(ciphertext);
  dataWithAuthTag.set(authTag, ciphertext.length);

  const keyBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, "AES-GCM", false, ["decrypt"]);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    dataWithAuthTag
  );

  return JSON.parse(new TextDecoder().decode(decryptedBuffer));
}
