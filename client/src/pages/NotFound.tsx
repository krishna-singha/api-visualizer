import { NavLink } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex-1 flex w-full items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-6xl sm:text-8xl font-extrabold text-red-500">
          404
        </h1>
        <p className="text-lg sm:text-xl text-gray-300">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <NavLink
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Go Back Home
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
