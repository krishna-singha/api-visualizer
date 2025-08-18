import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md bg-gray-900/70 border border-gray-700 p-6 sm:p-8 rounded-2xl shadow-xl text-center text-white">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Welcome to <span className="text-blue-400">API Visualizer</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mt-2">
          Login with your Google account
        </p>
        <button
          onClick={login}
          className="w-full mt-6 px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm sm:text-base transition cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
