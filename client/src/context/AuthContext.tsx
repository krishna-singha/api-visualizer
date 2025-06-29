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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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
                        apiCreatedAt: status ? new Date(apiCreatedAt).toLocaleString() : null,
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
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
