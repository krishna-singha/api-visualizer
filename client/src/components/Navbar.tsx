import { useState, useRef, useEffect } from "react";
import { Activity, Settings, KeyRound, Menu, X } from "lucide-react";
import { ConnectionStatus } from "./ConnectionStatus";
import DEFAULT_AVATAR from "../assets/photos/defaultAvatar";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSocketContext } from "../context/SocketContext";
import axios from "axios";

const useOutsideClick = (refs: React.RefObject<HTMLElement>[], onClickOutside: () => void) => {
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (refs.every(ref => ref.current && !ref.current.contains(e.target as Node))) {
                onClickOutside();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [refs, onClickOutside]);
};

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const {
        connectionStatus,
        isConnecting,
        disconnect,
        connect,
        clearAllData,
        historyMode,
        setHistoryMode,
    } = useSocketContext();

    const [dropdowns, setDropdowns] = useState({ profile: false, connection: false, settings: false });
    const [mobileOpen, setMobileOpen] = useState(false);

    const refs = {
        profile: useRef<HTMLDivElement>(null),
        connection: useRef<HTMLDivElement>(null),
        settings: useRef<HTMLDivElement>(null),
    };

    useOutsideClick(
        Object.values(refs) as React.RefObject<HTMLElement>[],
        () => setDropdowns({ profile: false, connection: false, settings: false })
    );

    const closeAllDropdowns = () => setDropdowns({ profile: false, connection: false, settings: false });

    const toggle = (key: keyof typeof dropdowns) =>
        setDropdowns(prev => ({
            profile: key === "profile" ? !prev.profile : false,
            connection: key === "connection" ? !prev.connection : false,
            settings: key === "settings" ? !prev.settings : false,
        }));

    const handleToggleHistory = () => {
        setHistoryMode(!historyMode);
        closeAllDropdowns();
    };

    const handleClearLogs = () => {
        axios
            .delete(`/api/request-log/clear/${user?.uid}`)
            .then(res => (res.data.status ? clearAllData() : console.error("Error:", res.data.error)))
            .catch(console.error);
        closeAllDropdowns();
        setMobileOpen(false);
    };

    const handleLogout = () => {
        logout();
        closeAllDropdowns();
        setMobileOpen(false);
    };

    return (
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <NavLink to="/" className="flex items-center gap-3" onClick={() => { closeAllDropdowns(); setMobileOpen(false); }}>
                        <div className="relative">
                            <Activity className="h-8 w-8 text-blue-400" />
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">API Visualizer</h1>
                            <p className="text-xs text-gray-400">Live Request Monitor</p>
                        </div>
                    </NavLink>

                    {/* Desktop Controls */}
                    <div className="hidden sm:flex items-center gap-4">
                        <NavLink
                            to="/api-key"
                            onClick={() => closeAllDropdowns()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-700 text-sm text-white hover:bg-gray-600"
                        >
                            <KeyRound size={15} />
                            API Key
                        </NavLink>

                        {location.pathname === "/dashboard" && (
                            <div className="relative" ref={refs.connection}>
                                <button onClick={() => toggle("connection")}>
                                    <ConnectionStatus status={connectionStatus} isConnecting={isConnecting} />
                                </button>
                                {dropdowns.connection && (
                                    <div
                                        className="absolute right-0 mt-3 w-56 bg-gray-900 text-white rounded-xl border border-gray-700 shadow-lg p-4 space-y-4 z-50"
                                        onClick={closeAllDropdowns}
                                    >
                                        <h3 className="text-sm font-semibold text-gray-300">
                                            {isConnecting
                                                ? "Connecting..."
                                                : connectionStatus
                                                    ? "Want to Disconnect?"
                                                    : "Want to Connect?"}
                                        </h3>
                                        <button
                                            onClick={connectionStatus ? disconnect : connect}
                                            disabled={isConnecting}
                                            className={`cursor-pointer w-full py-2 rounded-lg text-sm font-medium transition ${isConnecting
                                                ? "bg-gray-600 opacity-50 cursor-not-allowed"
                                                : connectionStatus
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-emerald-500 hover:bg-emerald-600"
                                                }`}
                                        >
                                            {isConnecting ? "Connecting..." : connectionStatus ? "Disconnect" : "Connect"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings */}
                        <div className="relative" ref={refs.settings}>
                            <button
                                onClick={() => toggle("settings")}
                                className="cursor-pointer p-2 text-gray-400 hover:text-white"
                            >
                                <Settings className="h-5 w-5" />
                            </button>
                            {dropdowns.settings && (
                                <div
                                    className="absolute right-0 mt-3 w-64 bg-gray-900 text-white rounded-xl border border-gray-700 shadow-lg p-4 z-50 space-y-4"
                                    onClick={closeAllDropdowns}
                                >
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
                                                className={`w-10 h-5 flex items-center p-[0.1rem] cursor-pointer rounded-full transition bg-gray-600`}
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
                                                className="cursor-pointer w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
                                            >
                                                Clear All Request Logs
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="relative" ref={refs.profile}>
                            <div
                                className="w-10 h-10 border border-gray-400 rounded-full overflow-hidden p-[0.15rem] cursor-pointer bg-gray-700 flex items-center justify-center"
                                onClick={() => (user ? toggle("profile") : navigate("/login"))}
                            >
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="avatar"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : user ? (
                                    <span className="text-white text-lg font-semibold">
                                        {user.displayName?.[0] ?? "?"}
                                    </span>
                                ) : (
                                    <img
                                        src={DEFAULT_AVATAR}
                                        alt="avatar"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                )}
                            </div>

                            {user && dropdowns.profile && (
                                <div
                                    className="absolute right-0 mt-2 w-fit bg-gray-800 border border-gray-700 rounded-lg p-3 text-white shadow-lg z-50"
                                    onClick={closeAllDropdowns}
                                >
                                    <p className="text-sm mb-3">{user.email}</p>
                                    <div
                                        onClick={handleLogout}
                                        className="bg-red-500 text-center py-2 rounded-md hover:bg-red-600 transition cursor-pointer"
                                    >
                                        Logout
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        className="sm:hidden text-gray-300 hover:text-white p-2"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="sm:hidden h-[calc(100vh-4rem)] bg-gray-900/80 border-t border-gray-700 p-4 space-y-6 rounded-b-2xl shadow-lg">
                    {/* Navigation */}
                    <div className="space-y-2">
                        <h3 className="text-xs uppercase text-gray-400 tracking-wider">Navigation</h3>
                        <NavLink
                            to="/api-key"
                            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800 text-sm text-white hover:bg-gray-700 transition"
                            onClick={() => setMobileOpen(false)}
                        >
                            <KeyRound size={16} />
                            API Key
                        </NavLink>
                    </div>

                    {/* Dashboard Controls */}
                    <div className="space-y-3 text-sm">
                        <h3 className="text-xs uppercase text-gray-400 tracking-wider">Settings</h3>
                        <div
                            className="bg-gray-800 rounded-lg p-4 space-y-4 border border-gray-700"
                            onClick={() => setMobileOpen(false)}
                        >
                            <div className="font-semibold text-gray-300 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <Settings size={16} />
                                    <div className="flex items-center gap-2">
                                        <span>History</span>
                                        <span className="text-xs text-gray-500">
                                            {historyMode ? "Saves to DB" : "Frontend only"}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    onClick={handleToggleHistory}
                                    className="w-10 h-5 flex items-center p-[0.1rem] cursor-pointer rounded-full transition bg-gray-600"
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full shadow-md transform transition ${historyMode ? "translate-x-5 bg-green-500" : "bg-white"
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={handleClearLogs}
                                className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 transition text-gray-100"
                            >
                                Clear All Request Logs
                            </button>
                        </div>
                    </div>

                    {user && (
                        <div className="space-y-3" onClick={() => setMobileOpen(false)}>
                            <h3 className="text-xs uppercase text-gray-400 tracking-wider">Profile</h3>

                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <p className="text-sm text-gray-300 mb-3">{user.email}</p>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 transition text-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
