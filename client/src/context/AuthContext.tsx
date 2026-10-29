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
        <AuthContext.Provider value={{ user, login, logout, loading, updateApiKey }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
