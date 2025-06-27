import { NavLink } from "react-router-dom";

const LandingPage = () => {
    return (
        <main className="flex flex-col items-center justify-center text-center px-6 flex-1 text-white">
            <h1 className="text-4xl md:text-6xl font-bold">
                Inspect API Requests Live
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mb-8">
                Monitor your localhost traffic from anywhere. Connect your local server,
                capture requests, and debug seamlessly — like magic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <NavLink to={"/dashboard"} className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50"
                >
                    Monitor API
                </NavLink>
                <NavLink to={"/download"} className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50"
                >
                    Download Agent
                </NavLink>
            </div>
        </main>
    );
};

export default LandingPage;
