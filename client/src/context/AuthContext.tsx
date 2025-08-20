import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import type { ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import axios from "axios";
import { X } from "lucide-react"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = BACKEND_URL;

interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    apiKey: string | null;
    apiCreatedAt: string | null;
}

interface AuthContextType {
    user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    showTimeoutModal: boolean;
    setShowTimeoutModal: (show: boolean) => void;
    updateApiKey: (apiKey: string, apiCreatedAt: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    // Shared so routes + socket see a new/regenerated key without reload
    const updateApiKey = (apiKey: string, apiCreatedAt: string) => {
        setUser((prev) => (prev ? { ...prev, apiKey, apiCreatedAt: formatDate(apiCreatedAt) } : prev));
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Ping backend on mount to check server is awake or not
    useEffect(() => {
        const ping = async () => {
            let awake = false;

            while (!awake) {
                try {
                    const res = await axios.get("/ping", { timeout: 5000 });
                    if (res.status === 200) {
                        awake = true;
                        setShowTimeoutModal(false);
                    }
                } catch {
                    setShowTimeoutModal(true);
                    await new Promise((r) => setTimeout(r, 5000));
                }
            }
        };
        ping();
    }, []);

    // Firebase auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (firebaseUser: FirebaseUser | null) => {
                if (firebaseUser) {
                    const { uid, email, displayName, photoURL } = firebaseUser;

                    try {
                        const res = await axios.get(`/api/key/get/${uid}`);
                        const { status, apiKey, apiCreatedAt } = res.data;

                        setUser({
                            uid,
                            email,
                            displayName,
                            photoURL,
                            apiKey: status ? apiKey : null,
                            apiCreatedAt: status ? formatDate(apiCreatedAt) : null,
                        });
                    } catch (err) {
                        console.error("Failed to fetch API key:", err);
                        setUser({
                            uid,
                            email,
                            displayName,
                            photoURL,
                            apiKey: null,
                            apiCreatedAt: null,
                        });
                    }
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, showTimeoutModal, setShowTimeoutModal, updateApiKey }}>
            {children}

            {/* Timeout Modal */}
            {showTimeoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                    <div className="relative bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700 p-8 w-full max-w-md text-center text-white shadow-lg">

                        <button
                            onClick={() => setShowTimeoutModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-xl font-semibold mb-4">Connection Timeout</h3>
                        <p className="mb-6 text-gray-300">
                            The connection is taking longer than expected.
                            Maybe the Backend server on Render is currently asleep.
                            Click the button below to wake it up
                        </p>

                        <a
                            href={`${import.meta.env.VITE_BACKEND_URL}/ping`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition text-white"
                        >
                            Start Render Server
                        </a>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
