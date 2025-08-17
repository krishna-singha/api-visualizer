import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { parseToApiData } from "../lib/parseToApiData";
import type { ApiData } from "../lib/parseToApiData";
import { io, Socket } from "socket.io-client";
import { X } from "lucide-react"

interface SocketContextType {
  connectionStatus: boolean;
  isConnecting: boolean;
  showTimeoutModal: boolean;
  data: ApiData[];
  historyData: ApiData[];
  historyMode: boolean;
  connect: () => void;
  disconnect: () => void;
  clearHistory: () => void;
  clearAllData: () => void;
  setHistoryData: (data: ApiData[]) => void;
  setHistoryMode: (enabled: boolean) => void;
  hideTimeoutModal: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [data, setData] = useState<ApiData[]>([]);
  const [historyData, setHistoryData] = useState<ApiData[]>([]);
  const [historyMode, setHistoryModeState] = useState(() => {
    const saved = localStorage.getItem('history-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setHistoryMode = (enabled: boolean) => {
    setHistoryModeState(enabled);
    localStorage.setItem('history-mode', JSON.stringify(enabled));
  };

  const clearHistory = () => setHistoryData([]);
  const clearAllData = () => {
    setHistoryData([]);
    setData([]);
  };

  useEffect(() => {
    if (!historyMode) setHistoryData([]);
  }, [historyMode]);

  const connect = () => {
    if (!user?.apiKey || socketRef.current) return;

    setIsConnecting(true);
    setShowTimeoutModal(false);

    if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);

    // 10-second timeout to show modal
    connectTimeoutRef.current = setTimeout(() => {
      setIsConnecting(false);
      setShowTimeoutModal(true);
      console.warn("Connection timeout - taking longer than expected");
    }, 10000);

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { apiKey: user.apiKey, type: "frontend" },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
      setConnectionStatus(true);
      setIsConnecting(false);
      setShowTimeoutModal(false);
      console.log("Connected to API Visualizer");
    });

    socket.on("disconnect", () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
      setConnectionStatus(false);
      setIsConnecting(false);
      console.log("Disconnected from API Visualizer");
    });

    socket.on("connect_error", (err) => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
      setIsConnecting(false);
      setShowTimeoutModal(true);
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
      } catch {
        console.warn("Invalid payload:", payload);
      }
    });

    socketRef.current = socket;
  };

  const disconnect = () => {
    setIsConnecting(false);
    if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnectionStatus(false);
    console.log("Manually disconnected from API Visualizer");
  };

  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      disconnect();
    };
  }, []);

  const hideTimeoutModal = () => setShowTimeoutModal(false);

  return (
    <SocketContext.Provider
      value={{
        connectionStatus,
        isConnecting,
        showTimeoutModal,
        data,
        historyData,
        historyMode,
        connect,
        disconnect,
        clearHistory,
        clearAllData,
        setHistoryData,
        setHistoryMode,
        hideTimeoutModal,
      }}
    >
      {children}

      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="relative bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700 p-8 w-full max-w-md text-center text-white shadow-lg">

            <button
              onClick={hideTimeoutModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-semibold mb-4">Connection Timeout</h3>
            <p className="mb-6 text-gray-300">
              The connection is taking longer than expected. Click the button below to start the render server.
            </p>

            <a
              href={import.meta.env.VITE_BACKEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition text-white"
            >
              Start Render Server
            </a>
          </div>
        </div>
      )}

    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocketContext must be used within a SocketProvider");
  return context;
};

// Decrypt JSON function remains unchanged
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

  const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, dataWithAuthTag);
  return JSON.parse(new TextDecoder().decode(decryptedBuffer));
}