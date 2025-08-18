import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { parseToApiData } from "../lib/parseToApiData";
import type { ApiData } from "../lib/parseToApiData";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  connectionStatus: boolean;
  isConnecting: boolean;
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

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, showTimeoutModal, setShowTimeoutModal } = useAuth();
  const [data, setData] = useState<ApiData[]>([]);
  const [historyData, setHistoryData] = useState<ApiData[]>([]);
  const [historyMode, setHistoryModeState] = useState(() => {
    // Get initial value from localStorage, default to false
    const saved = localStorage.getItem('history-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!user?.apiKey || socketRef.current || showTimeoutModal) return;

    setIsConnecting(true);

    let awake = false;
    while (!awake) {
      if (showTimeoutModal) {
        // If modal opens while waiting, stop completely
        setIsConnecting(false);
        return;
      }
      try {
        const res = await axios.get("/ping", { timeout: 5000 });
        if (res.status === 200) {
          awake = true;
          setShowTimeoutModal(false);
          break;
        }
      } catch (err) {
        setShowTimeoutModal(true);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    if (showTimeoutModal) return;

    // Clear any existing timeout
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }

    connectTimeoutRef.current = setTimeout(() => {
      setIsConnecting(false);
      console.warn("Socket connection timeout - taking longer than expected");
    }, 10000);

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { apiKey: user.apiKey, type: "frontend" },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      setConnectionStatus(true);
      setIsConnecting(false);
    });

    socket.on("disconnect", () => {
      setConnectionStatus(false);
      setIsConnecting(false);
    });

    socket.on("connect_error", (err) => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      setIsConnecting(false);
      console.error("Socket.IO connection error:", err.message);
    });

    socket.on("log", async (payload: { data: string }) => {
      try {
        const decrypted = await decryptJSON(payload.data, user.apiKey!);
        const apiData = parseToApiData(decrypted);
        setData((prev) => [apiData, ...prev]);

        if (historyMode) {
          await axios.post("/api/request-log/add", { uid: user.uid, apiData });
        }
      } catch (err) {
        console.warn("Invalid payload:", payload);
      }
    });

    socketRef.current = socket;
  };

  const disconnect = () => {
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

  return (
    <SocketContext.Provider
      value={{
        connectionStatus,
        isConnecting,
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

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

async function decryptJSON(encrypted: string, secret: string): Promise<any> {
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
