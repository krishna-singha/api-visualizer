import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { parseToApiData } from "../lib/parseToApiData";
import type { ApiData } from "../lib/parseToApiData";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  connectionStatus: boolean;
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
  const { user } = useAuth();
  const [data, setData] = useState<ApiData[]>([]);
  const [historyData, setHistoryData] = useState<ApiData[]>([]);
  const [historyMode, setHistoryModeState] = useState(() => {
    // Get initial value from localStorage, default to false
    const saved = localStorage.getItem('history-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [connectionStatus, setConnectionStatus] = useState(false);
  const socketRef = useRef<Socket | null>(null);

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

  const connect = () => {
    if (!user?.apiKey || socketRef.current) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      query: {
        apiKey: user.apiKey,
        type: "frontend",
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setConnectionStatus(true);
      console.log("✅ Socket.IO connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus(false);
      console.log("🔌 Socket.IO disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket.IO connection error:", err.message);
    });

    socket.on("log", async (payload: { data: string }) => {
      try {
        const decrypted = await decryptJSON(payload.data, user.apiKey!);
        const apiData = parseToApiData(decrypted);
        setData((prev) => [apiData, ...prev]);

        // Only save to database if history mode is enabled
        if (historyMode) {
          await axios.post("/api/request-log/add", {
            uid: user.uid,
            apiData,
          });
        }
      } catch (err) {
        console.warn("Invalid payload:", payload);
      }
    });

    socketRef.current = socket;
  };


  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnectionStatus(false);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        connectionStatus,
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
