import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { parseToApiData } from "../lib/parseToApiData";
import type { ApiData } from "../lib/parseToApiData";

interface SocketContextType {
  connectionStatus: boolean;
  data: ApiData[];
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ApiData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      try {
        const rawText = typeof event.data === "string" ? event.data : await event.data.text();
        const payload = JSON.parse(rawText);

        // If encrypted
        if (!user?.apiKey) {
          throw new Error("API key is missing for decryption.");
        }
        const decrypted = await decryptJSON(payload.data, user.apiKey);
        // console.log("Decrypted:", decrypted);

        const apiData = parseToApiData(decrypted);
        // console.log(apiData);
        
        
        setData((prev) => [apiData, ...prev]);

        // Optional DB saving
        await axios.post("/api/request-log/add", {
          uid: user?.uid,
          apiData,
        });

      } catch (e) {
        console.warn("Invalid WebSocket payload:", event.data);
      }
    },
    [user?.uid]
  );


  const connect = () => {
    if (!user?.apiKey || wsRef.current) return;

    const socket = new WebSocket(
      `${import.meta.env.VITE_WS_SERVER_URL}/frontend?apiKey=${user.apiKey}`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus(true);
    };

    socket.onmessage = handleMessage;

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus(false);
    };

    socket.onerror = () => {
      console.error("WebSocket error");
      setConnectionStatus(false);
    };

    wsRef.current = socket;
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setConnectionStatus(false);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        connectionStatus,
        data,
        connect,
        disconnect,
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

  const decrypted = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decrypted);
}
