import { useEffect, useState } from "react";
import { Copy, Check, EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";


const ApiKey = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if(user){
        setApiKey(user.apiKey);
        setCreatedAt(user.apiCreatedAt);
    }
    }, [user])

    const generateApiKey = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await axios.post("/api/key/add", {
                name: user.displayName,
                uid: user.uid,
                email: user.email,
                photoURL: user.photoURL,
            });
            const { status, apiKey, apiCreatedAt } = res.data;
            if (status && apiKey && apiCreatedAt) {
                setApiKey(apiKey);
                setCreatedAt(new Date(apiCreatedAt).toLocaleString());
            }
        } catch (err) {
            console.error("Error generating API key:", err);
        } finally {
            setLoading(false);
        }
    };

    const reGenerateApiKey = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await axios.put("/api/key/update", { uid: user.uid });
            const { status, apiKey, apiCreatedAt } = res.data;
            if (status && apiKey && apiCreatedAt) {
                setApiKey(apiKey);
                setCreatedAt(new Date(apiCreatedAt).toLocaleString());
            }
        } catch (err) {
            console.error("Error regenerating API key:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!apiKey) return;
        try {
            await navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full py-12 px-6 text-white">
            {apiKey ? (
                <div className="bg-gray-900/60 border border-gray-700 p-6 rounded-xl shadow-md space-y-5 w-full">
                    <div className="text-center mb-6 text-sm text-yellow-300">
                        ⚠️ Do not share your API key with others!
                    </div>

                    <div>
                        <p className="text-sm text-gray-400 mb-1">🔑 API Key</p>
                        <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-sm font-mono break-all flex justify-between items-center">
                            <span className="text-white break-all">
                                {showKey ? apiKey : "•".repeat(50)}
                            </span>

                            <div className="flex gap-2 items-center ml-4">
                                <button
                                    onClick={() => setShowKey(prev => !prev)}
                                    className="text-gray-400 hover:text-white cursor-pointer"
                                    title={showKey ? "Hide API Key" : "Show API Key"}
                                >
                                    {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className="text-gray-400 hover:text-white cursor-pointer"
                                    title="Copy API Key"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                        </div>
                        {copied && (
                            <p className="text-xs text-emerald-400 mt-1">Copied to clipboard!</p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-gray-400 mb-1">📅 Generated At</p>
                        <p className="text-sm text-gray-300">{createdAt || "Unknown"}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={reGenerateApiKey}
                            disabled={loading}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Regenerating..." : "🔄 Regenerate API Key"}
                        </button>

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                            🚀 Go to Dashboard
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900/60 border border-gray-700 p-6 rounded-xl shadow-md space-y-5 text-center">
                    <div className="text-3xl text-yellow-400">🔐</div>
                    <h2 className="text-lg font-semibold">No API Key Found</h2>
                    <p className="text-sm text-gray-400">
                        You don&rsquo;t have an API key yet. Click below to generate one and start monitoring your APIs securely.
                    </p>
                    <button
                        onClick={generateApiKey}
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Generating..." : "Generate API Key"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ApiKey;
