import { useState } from 'react';
import { Activity, Settings, KeyRound } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import DEFAULT_AVATAR from '../assets/photos/defaultAvatar';
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSocketContext } from '../context/SocketContext';

const Navbar = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const { connectionStatus, disconnect, connect } = useSocketContext();


    const [openProfile, setOpenProfile] = useState(false);
    const [openConnection, setOpenConnection] = useState(false);
    const [settings, setSettings] = useState(false);

    const toggleProfile = () => {
        setOpenProfile(!openProfile);
        if (openConnection) setOpenConnection(false);
        if (settings) setSettings(false);
    };

    const toggleOpenConnection = () => {
        setOpenConnection(!openConnection);
        if (openProfile) setOpenProfile(false);
        if (settings) setSettings(false);
    };

    const toggleSettings = () => {
        setSettings(!settings);
        if (openProfile) setOpenProfile(false);
        if (openConnection) setOpenConnection(false);
    }

    return (
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <NavLink to={"/"}>
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Activity className="h-8 w-8 text-blue-400" />
                                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">API Visualizer</h1>
                                    <p className="text-xs text-gray-400">Live Request Monitor</p>
                                </div>
                            </div>
                        </NavLink>
                    </div>

                    <div className="flex items-center space-x-4">
                        <NavLink to={"/documentation"} className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                            Documentation
                        </NavLink>

                        <NavLink
                            to="/api-key"
                            className={`inline-flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 bg-gray-700 text-white hover:bg-gray-600 hover:text-white`}
                        >
                            <KeyRound size={15} />
                            API Key
                        </NavLink>

                        <div className={` ${location.pathname !== "/dashboard" && "hidden"} flex gap-2`}>
                            <div className="relative">
                                <button
                                    onClick={toggleOpenConnection}
                                    className="focus:outline-none"
                                    aria-haspopup="true"
                                    aria-expanded={openConnection}
                                >
                                    <ConnectionStatus status={connectionStatus} />
                                </button>

                                {openConnection && (
                                    <div className="absolute right-0 mt-4 w-56 bg-gray-900 text-white rounded-xl shadow-xl border border-gray-700 p-4 z-50 space-y-4 transition-all animate-fade-in">
                                        <h3 className="text-sm font-semibold text-gray-300">
                                            {connectionStatus ? "Want to Disconnect?" : "Want to Connect?"}
                                        </h3>

                                        <button
                                            onClick={connectionStatus ? disconnect : connect}
                                            className={`cursor-pointer w-full text-sm font-medium py-2 rounded-lg transition-all ${connectionStatus
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-emerald-500 hover:bg-emerald-600"
                                                }`}
                                        >
                                            {connectionStatus ? "Disconnect" : "Connect"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
                                <div>
                                    <Settings className="h-5 w-5" onClick={toggleSettings} />
                                </div>
                                {settings && (
                                    <div className="absolute right-0 mt-4 w-56 bg-gray-900 text-white rounded-xl shadow-xl border border-gray-700 p-4 z-50 space-y-4 transition-all animate-fade-in">
                                        <h3 className="text-sm font-semibold text-gray-300">Settings</h3>
                                        <ul className="space-y-2">
                                            <li>
                                                <button
                                                    onClick={() => navigate("/settings")}
                                                    className="w-full text-left text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-all"
                                                >
                                                    Store request logs
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => navigate("/settings/advanced")}
                                                    className="w-full text-left text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-all"
                                                >
                                                    Clear all request logs
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <div
                                className="w-10 h-10 border border-gray-400 rounded-full overflow-hidden p-[0.15rem] cursor-pointer focus:outline-none flex justify-center items-center bg-gray-700"
                                tabIndex={0}
                                onClick={() => {
                                    user ? toggleProfile() : navigate("/login");
                                }}
                            >
                                {user ? (
                                    user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="avatar"
                                            className="w-full h-full rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <span className="text-white text-lg font-semibold">
                                            {user?.displayName?.charAt(0) ?? "?"}
                                        </span>
                                    )
                                ) : (
                                    <img
                                        src={DEFAULT_AVATAR}
                                        alt="avatar"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                )}

                            </div>

                            {user && openProfile && (
                                <div className="absolute right-0 mt-2 w-fit bg-gray-800 rounded-md shadow-lg p-2 text-white border z-50">
                                    <p className="text-sm mb-3">{user.email}</p>
                                    <div onClick={logout} className="bg-red-500 text-center rounded px-2 py-1 cursor-pointer hover:bg-red-600 transition">
                                        Logout
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar;