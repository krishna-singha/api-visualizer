// src/pages/Login.tsx
import { auth, googleProvider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {

  const { login } = useAuth();


  return (
    <div className="flex-1 h-full w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-gray-900/60 border border-gray-700 p-8 rounded-xl shadow-lg text-center space-y-4 w-full max-w-sm text-white">
        <h1 className="text-2xl font-semibold">Welcome to API Visualizer</h1>
        <p className="text-gray-400">Login with your Google account</p>
        <button
          onClick={login}
          className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded w-full mt-4 cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
