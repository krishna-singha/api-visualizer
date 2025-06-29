import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
