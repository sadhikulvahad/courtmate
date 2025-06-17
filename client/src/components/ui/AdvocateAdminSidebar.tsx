// AdvocateAdminSidebar.tsx

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Settings,
  Star,
  Bell,
  Briefcase,
  UserCircle,
  LogOut,
  Menu,
  X,
  Users,
  Gavel,
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import logo from "../../assets/COURTMATE_Black.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "@/features/authSlice";
import ConfirmationModal from "../ConfirmationModal";

const AdvocateAdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Define menu items
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ...(user?.role === "advocate"
      ? [
          { icon: MessageSquare, label: "Messages", path: "/chat" },
          {
            icon: Calendar,
            label: "Appointments",
            path: "/advocate/appointments",
          },
          { icon: Settings, label: "Settings", path: "/advocate/settings" },
          { icon: Star, label: "Ratings and Reviews", path: "/advocate/reviews" },
          { icon: Briefcase, label: "Cases", path: "/advocate/cases" },
          { icon: UserCircle, label: "Profile", path: "/advocate/adProfile" },
        ]
      : []),
    ...(user?.role === "admin"
      ? [
          { icon: Users, label: "Users", path: "/users" },
          { icon: Gavel, label: "Advocates", path: "/AdAdvocates" },
        ]
      : []),
    { icon: Bell, label: "Notifications", path: "/notification" },
  ];

  // Determine active item based on current path
  const getActiveItemFromPath = () => {
    const currentPath = location.pathname;
    const matchingItem = menuItems.find(
      (item) =>
        currentPath === item.path ||
        (item.path !== "/dashboard" && currentPath.startsWith(item.path))
    );
    return matchingItem?.label || "Dashboard";
  };

  const [activeItem, setActiveItem] = useState(() => getActiveItemFromPath());

  // Update active item when location changes
  useEffect(() => {
    setActiveItem(getActiveItemFromPath());
  }, [location.pathname]);

  useEffect(() => {
    if (user === null) return; // Don't redirect if user not yet loaded

    if (!isAuthenticated) {
      navigate("/signup");
    } else if (user?.role === "user") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    setIsModalOpen(true);
    // dispatch(logout());
  };

  return (
    <>
      {isModalOpen && (
        <ConfirmationModal
          title="Confirm Logout"
          description="Are you sure you want to logout?"
          isOpen = {isModalOpen}
          onConfirm={() => {
            setIsModalOpen(false);
            dispatch(logout());
            navigate("/signup"); // or wherever you redirect on logout
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center w-full h-16 px-4 py-3 shadow border-b bg-white sticky top-0 z-50">
        <img src={logo} alt="Logo" className="w-28" />
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`py-4 fixed md:sticky top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen w-60 md:w-64 bg-white border-r shadow-md z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:block
        `}
      >
        <div className="h-full flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="hidden md:block px-6 py-4">
              <img src={logo} alt="Logo" className="w-40 mx-auto" />
            </div>
            <div className="px-4">
              {user &&
                menuItems.map((item) => (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={activeItem === item.label}
                    onClick={() => {
                      setActiveItem(item.label);
                      setIsOpen(false);
                      navigate(item.path);
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Logout Button */}
          <div className="px-4 py-12 flex items-end justify-end">
            <button
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvocateAdminSidebar;
