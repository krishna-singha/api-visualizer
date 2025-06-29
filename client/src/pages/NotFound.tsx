import { NavLink } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex-1 h-full w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <h1 className="text-6xl font-bold text-red-500">404</h1>
            <p className="mt-4 text-xl text-white">Page Not Found</p>
            <NavLink to="/" className="mt-6 text-blue-500 hover:underline">
                Go back to Home
            </NavLink>
        </div>
    );
}

export default NotFound;