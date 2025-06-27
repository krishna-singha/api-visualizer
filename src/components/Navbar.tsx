import { useState } from 'react';
import { Activity, Settings } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { useSocket } from '../hooks/useSocket';
import DEFAULT_AVATAR from '../assets/photos/defaultAvatar';
import { useAuth } from "../context/AuthContext";
import { NavLink } from 'react-router-dom';

const Navbar = () => {

    const { user, login, logout, loading } = useAuth();

    const { connectionStatus } = useSocket();

    const [openProfile, setOpenProfile] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    const toggleProfile = () => {
        setOpenProfile(!openProfile);
        if (openSettings) setOpenSettings(false);
    };

    const toggleSettings = () => {
        setOpenSettings(!openSettings);
        if (openProfile) setOpenProfile(false);
    };

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
                        <ConnectionStatus status={connectionStatus} />

                        {/* // Settings  */}
                        <div className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
                            <Settings className="h-5 w-5" onClick={toggleSettings} />

                            {openSettings && (
                                <div className="absolute right-0 mt-3 w-48 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700 p-3 z-50 space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-300">Settings</h3>

                                    {connectionStatus ? (
                                        <button className="w-full bg-red-500 text-sm font-medium py-2 rounded-lg hover:bg-red-600 transition-all">
                                            Disconnect
                                        </button>
                                    ) : (
                                        <button className="w-full bg-emerald-500 text-sm font-medium py-2 rounded-lg hover:bg-emerald-600 transition-all">
                                            Connect
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* // avatar */}
                        <div className="relative">
                            <div
                                className="w-10 h-10 border border-gray-400 rounded-full overflow-hidden p-1 cursor-pointer focus:outline-none flex justify-center items-center bg-gray-700"
                                tabIndex={0}
                                onClick={() => {
                                    user ? toggleProfile() : login();
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