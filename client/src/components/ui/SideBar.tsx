import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faHome,
  faUser,
  faSignOutAlt,
  // faHistory,
  faBookmark,
  faInfoCircle,
  faEnvelope,
  // faList,
  faCog,
  faSignIn,
  faBookBookmark,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/features/authSlice";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../ConfirmationModal";

interface SideBarProps {
  closeSidebar: () => void;
}

interface SideBarProps {
  closeSidebar: () => void;
  screenSize: number;
}
const SideBar: React.FC<SideBarProps> = ({ closeSidebar }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(true);
    // dispatch(logout());
  };

  const sidebarItems = isAuthenticated
    ? [
        { name: "Profile", icon: faUser, path: "/profile" },
        { name: "Home", icon: faHome, path: "/" },
        { name: "My Activity", icon: faCog, path: "/activity" },
        {name: "My Bookings", icon: faBookBookmark, path: '/bookings'},
        {name: "Messages", icon: faMessage, path: '/chat'},
        { name: "Saved Advocates", icon: faBookmark, path: "/savedAdvocate" },
        // { name: "History", icon: faHistory, path: "*" },
        {
          name: "Logout",
          icon: faSignOutAlt,
          path: "*",
          onclick: handleLogout,
        },
      ]
    : [
        { name: "Sign In", icon: faSignIn, path: "/signup" },
        { name: "Home", icon: faHome, path: "/" },
      ];

  const responsiveItems = isAuthenticated
    ? [
        {
          name: "Services",
          icon: faCog,
          hideOnMd: true,
          hideOnLg: true,
          path: "*",
        },
        // {
        //   name: "Category",
        //   icon: faList,
        //   hideOnMd: false,
        //   hideOnLg: true,
        //   path: "*",
        // },
        {
          name: "About Us",
          icon: faInfoCircle,
          hideOnMd: false,
          hideOnLg: true,
          path: "*",
        },
        {
          name: "Contact Us",
          icon: faEnvelope,
          hideOnMd: false,
          hideOnLg: true,
          path: "*",
        },
      ]
    : [
        {
          name: "About Us",
          icon: faInfoCircle,
          hideOnMd: true,
          hideOnLg: false,
          path: "*",
        },
        {
          name: "Services",
          icon: faCog,
          hideOnMd: false,
          hideOnLg: true,
          path: "*",
        },
      ];

  // Filter items based on screen size
  const getFilteredResponsiveItems = () => {
    return responsiveItems.filter((item) => {
      if (windowWidth >= 1024) {
        // lg
        return !item.hideOnLg;
      } else if (windowWidth >= 768) {
        // md
        return !item.hideOnMd;
      }
      return true; // On mobile, show all items except those in navbar
    });
  };

  return (
    <>
      {isOpen && (
        <ConfirmationModal
          title="Confirm Logout"
          description="Are you sure you want to logout?"
          isOpen={isOpen}
          onConfirm={() => {
            setIsOpen(false);
            dispatch(logout());
            navigate("/"); // or wherever you redirect on logout
          }}
          onCancel={() => setIsOpen(false)}
        />
      )}
      <div className="h-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={closeSidebar}
            className="text-white hover:bg-gray-700 p-2 rounded-full transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        <ul className="space-y-1">
          {sidebarItems.map((item, index) => (
            <li
              key={`fixed-${index}`}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:translate-x-1"
              onClick={() => {
                if (item.onclick) {
                  item.onclick();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
            >
              <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
              <span>{item.name}</span>
            </li>
          ))}

          {sidebarItems.length > 0 && (
            <li className="border-t border-gray-700 my-4 pt-4"></li>
          )}

          {getFilteredResponsiveItems().map((item, index) => (
            <li
              key={`responsive-${index}`}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:translate-x-1"
            >
              <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SideBar;
