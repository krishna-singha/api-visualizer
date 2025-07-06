import { useState } from "react";
import { Activity, Settings, KeyRound } from "lucide-react";
import { ConnectionStatus } from "./ConnectionStatus";
import DEFAULT_AVATAR from "../assets/photos/defaultAvatar";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSocketContext } from "../context/SocketContext";
import axios from "axios";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { connectionStatus, disconnect, connect, clearAllData, historyMode, setHistoryMode } = useSocketContext();

    const [openProfile, setOpenProfile] = useState(false);
    const [openConnection, setOpenConnection] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const toggleProfile = () => {
        setOpenProfile(!openProfile);
        setOpenConnection(false);
        setSettingsOpen(false);
    };

    const toggleOpenConnection = () => {
        setOpenConnection(!openConnection);
        setOpenProfile(false);
        setSettingsOpen(false);
    };

    const toggleSettings = () => {
        setSettingsOpen(!settingsOpen);
        setOpenProfile(false);
        setOpenConnection(false);
    };

    const handleToggleHistory = () => {
        const newHistoryMode = !historyMode;
        setHistoryMode(newHistoryMode);
        
        if (newHistoryMode) {
            console.log("✅ History mode enabled - Request logs will be saved to database");
        } else {
            console.log("🚫 History mode disabled - Request logs will only show in frontend (cleared on refresh)");
        }
    };

    const handleClearLogs = () => {
        axios.delete(`/api/request-log/clear/${user?.uid}`)
            .then(response => {
                if (response.data.status) {
                    clearAllData();
                } else {
                    console.error("Error clearing logs:", response.data.error);
                }
            })
            .catch(error => {
                console.error("Error clearing logs:", error);
            });
    };

    return (
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <NavLink to="/" className="flex items-center gap-3">
                        <div className="relative">
                            <Activity className="h-8 w-8 text-blue-400" />
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">API Visualizer</h1>
                            <p className="text-xs text-gray-400">Live Request Monitor</p>
                        </div>
                    </NavLink>

                    {/* Controls */}
                    <div className="flex items-center gap-4">

                        {/* API Key Button */}
                        <NavLink to="/api-key" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-700 text-sm text-white hover:bg-gray-600">
                            <KeyRound size={15} />
                            API Key
                        </NavLink>

                        {/* Connection Status - only on dashboard */}
                        {location.pathname === "/dashboard" && (
                            <>
                                {/* Connection Dropdown */}
                                <div className="relative">
                                    <button onClick={toggleOpenConnection} className="cursor-pointer">
                                        <ConnectionStatus status={connectionStatus} />
                                    </button>
                                    {openConnection && (
                                        <div className="absolute right-0 mt-3 w-56 bg-gray-900 text-white rounded-xl border border-gray-700 shadow-lg p-4 space-y-4 z-50">
                                            <h3 className="text-sm font-semibold text-gray-300">
                                                {connectionStatus ? "Want to Disconnect?" : "Want to Connect?"}
                                            </h3>
                                            <button
                                                onClick={connectionStatus ? disconnect : connect}
                                                className={`cursor-pointer w-full py-2 rounded-lg text-sm font-medium transition ${connectionStatus
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-emerald-500 hover:bg-emerald-600"
                                                    }`}
                                            >
                                                {connectionStatus ? "Disconnect" : "Connect"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Settings Dropdown */}
                                <div className="relative">
                                    <button onClick={toggleSettings} className="cursor-pointer p-2 text-gray-400 hover:text-white">
                                        <Settings className="h-5 w-5" />
                                    </button>
                                    {settingsOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-gray-900 text-white rounded-xl border border-gray-700 shadow-lg p-4 z-50 space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-300">Settings</h3>
                                            <ul className="space-y-5 text-sm">
                                                <li className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span>History</span>
                                                        <span className="text-xs text-gray-500">
                                                            {historyMode ? "Saves to DB" : "Frontend only"}
                                                        </span>
                                                    </div>
                                                    <div
                                                        onClick={handleToggleHistory}
                                                        className={`w-10 h-5 flex items-center bg-gray-700 rounded-full p-[0.1rem] cursor-pointer transition ${historyMode ? "bg-blue-600" : "bg-gray-600"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded-full shadow-md transform transition ${historyMode ? "translate-x-5 bg-green-500" : "bg-white"
                                                                }`}
                                                        />
                                                    </div>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={handleClearLogs}
                                                        className="cursor-pointer w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-center transition"
                                                    >
                                                        Clear All Request Logs
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Profile Avatar */}
                        <div className="relative">
                            <div
                                className="w-10 h-10 border border-gray-400 rounded-full overflow-hidden p-[0.15rem] cursor-pointer bg-gray-700 flex items-center justify-center"
                                tabIndex={0}
                                onClick={() => (user ? toggleProfile() : navigate("/login"))}
                            >
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                ) : user ? (
                                    <span className="text-white text-lg font-semibold">{user?.displayName?.[0] ?? "?"}</span>
                                ) : (
                                    <img src={DEFAULT_AVATAR} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                )}
                            </div>


                            {user && openProfile && (
                                <div className="absolute right-0 mt-2 w-fit bg-gray-800 border border-gray-700 rounded-lg p-3 text-white shadow-lg z-50">
                                    <p className="text-sm mb-3">{user.email}</p>
                                    <div
                                        onClick={logout}
                                        className="bg-red-500 text-center py-2 rounded-md hover:bg-red-600 transition cursor-pointer"
                                    >
                                        Logout
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
