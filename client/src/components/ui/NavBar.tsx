import { faMoon, faUser } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/COURTMATE_Black.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef } from "react";
import SideBar from "./SideBar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [icon, setIcon] = useState<string | undefined>("");
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role == "advocate" || user?.role == "admin") {
      navigate("/dashboard");
    }
  }, [navigate, user?.role]);

  useEffect(() => {
    setIcon(user?.name[0].toLocaleUpperCase());
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogo = () => {
    navigate("/");
  };

  return (
    <div className="bg-gray-200 flex justify-between items-center w-full px-4 md:px-10 lg:px-28 mx-auto relative">
      {/* Logo - visible on all screen sizes */}
      <div className="py-4 cursor-pointer" onClick={handleLogo}>
        <img src={logo} alt="Logo" className="w-20 md:w-40 lg:w-48" />
      </div>

      {/* Main navigation items with responsive visibility */}
      <div className="hidden md:flex py-4 items-center gap-2 md:gap-6 lg:gap-12 text-xs md:text-sm lg:text-lg">
        {/* Always visible on md and lg screens */}
        <div className="hover:underline hover:decoration-1 hover:underline-offset-4 transition-all duration-300 cursor-pointer"
        onClick={() => navigate('/')}>
          Home
        </div>
        <div className="hover:underline hover:decoration-1 hover:underline-offset-4 transition-all duration-300 cursor-pointer"
        onClick={() => navigate('/advocates')}>
          Advocates
        </div>

        {/* Only visible on md and above */}
        <div className="hover:underline hover:decoration-1 hover:underline-offset-4 transition-all duration-300 cursor-pointer">
          Services
        </div>

        {/* Only visible on lg and above */}
        <div className="hidden lg:block hover:underline hover:decoration-1 hover:underline-offset-4 transition-all duration-300 cursor-pointer">
          Category
        </div>
        <div className="hidden lg:block hover:underline hover:decoration-1 hover:underline-offset-4 transition-all duration-300 cursor-pointer">
          About Us
        </div>
        <div className="hidden lg:block hover:underline hover:decoration-1 hover:underline-offset-4 transition-all duration-300 cursor-pointer">
          Contact Us
        </div>
      </div>

      {/* Mobile view - Only Home and Advocates */}
      <div className="flex md:hidden py-4 items-center gap-6">
        <div className="hover:underline hover:decoration-1 hover:underline-offset-4 transition-all duration-300 cursor-pointer">
          Home
        </div>
        <div className="hover:underline hover:decoration-1 hover:underline-offset-4 transition-all duration-300 cursor-pointer">
          Advocates
        </div>
      </div>

      {/* Right side items (moon and profile) with responsive visibility */}
      <div className="py-4 flex gap-4 items-center">
        {/* Moon icon - only visible on md and above */}
        <div className="hidden md:flex bg-transparent rounded-full border border-gray-600 items-center justify-center cursor-pointer">
          <FontAwesomeIcon icon={faMoon} className="w-4 h-4 p-2" />
        </div>

        <div
          className="bg-gray-600 rounded-full border border-gray-600 flex items-center justify-center w-8 h-8 text-white font-extrabold text-xl cursor-pointer"
          onClick={toggleSidebar}
        >
          <p className="">
            {isAuthenticated ? (
              icon
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )}
          </p>
        </div>
      </div>

      {/* Sidebar with animation */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-800 text-white z-20 shadow-xl w-64 transform transition-transform duration-500 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        ref={sidebarRef}
      >
        <SideBar closeSidebar={toggleSidebar} screenSize={window.innerWidth} />
      </div>
    </div>
  );
};

export default NavBar;
