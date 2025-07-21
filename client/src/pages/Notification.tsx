import {
  getAllNotification,
  markAllAsReadNotification,
  markAsReadNotificaiton,
} from "@/api/admin/notification";
import SearchBar from "@/components/SearchBar";
import NavBar from "@/components/ui/NavBar";
import { RootState } from "@/redux/store";
import type {
  Notification,
  NotificationTabs,
  NotificationType,
} from "@/types/Types";
import {
  faTriangleExclamation,
  faBell,
  faClockRotateLeft,
  faEye,
  faCircle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NotificationItemProps {
  notification: Notification;
  markAsRead: (id: string) => void;
}

const formatDateTime = (dateValue: Date | string | undefined): string => {
  if (!dateValue) return "N/A";

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";

  // Format: "May 7, 2025, 2:30 PM"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const NotificationItem = ({
  notification,
  markAsRead,
}: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case "Alert":
        return (
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="text-red-500"
          />
        );
      case "Reminder":
        return (
          <FontAwesomeIcon icon={faClockRotateLeft} className="text-blue-500" />
        );
      default:
        return <FontAwesomeIcon icon={faBell} className="text-gray-500" />;
    }
  };

  return (
    <div
      className={`flex items-start p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
        !notification.read ? "bg-blue-50" : ""
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex-shrink-0 mt-1 mr-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
          {getIcon()}
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          {/* <p className="font-medium text-gray-800">{notification.title}</p> */}
          <div className="flex items-center">
            <span className="text-xs text-gray-500">
              {formatDateTime(notification.createdAt)}
            </span>
            {!notification.read && (
              <FontAwesomeIcon
                icon={faCircle}
                className="ml-2 text-blue-500 text-xs"
              />
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
      </div>
    </div>
  );
};

const Notification = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<NotificationTabs>("all");
  const [activeSubTab, setActiveSubTab] = useState<NotificationType>("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchNotification = async () => {
      const response = await getAllNotification(token, user?.id);
      if (response?.data.success) {
        setNotifications(response.data.notifications);
      }
    };
    fetchNotification();
  }, [token, user?.id]);

  const filteredNotifications = notifications.filter(
    (notification: Notification) => {
      const matchesSearch = notification.message
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase());

      // Filter by main tab
      const matchesMainTab =
        activeTab === "all" ||
        (activeTab === "pending" && !notification.read) ||
        (activeTab === "seen" && notification.read);

      // Filter by sub tab
      const matchesSubTab =
        activeSubTab === "All" || notification.type === activeSubTab;

      return matchesSearch && matchesMainTab && matchesSubTab;
    }
  );

  const markAsRead = async (id: string) => {
    const notification = notifications.filter(
      (notification: Notification) => notification.id === id
    );
    if (notification[0].read) {
      return;
    } else {
      const response = await markAsReadNotificaiton(token, id);
      if (response?.data.success) {
        setNotifications(
          notifications.map((notification: Notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        toast.success(response.data.message || "Marked as Read");
      } else {
        toast.error(response?.data.error || "Something wrong");
      }
    }
  };

  const markAllAsRead = async () => {
    const notification = notifications.filter(
      (notification: Notification) => !notification.read
    );
    if (!notification.length) {
      return;
    } else {
      const response = await markAllAsReadNotification(token, user?.id);
      if (response?.data.success) {
        setNotifications(
          notifications.map((notification: Notification) => ({
            ...notification,
            read: true,
          }))
        );
        toast.success(response.data.message || "Marked All As Read");
      } else {
        toast.error(response?.data.error || "Something wrong");
      }
    }
  };

  const pendingCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {user?.role === "user" && (
        <>
          <NavBar />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft size={20} className="mr-1" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </>
      )}
      <div className={`bg-white rounded-lg shadow-md ${user?.role === 'user' ? 'max-w-7xl mx-auto px-4 py8' : ''}`}>
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Notifications
              </h2>
              {pendingCount > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </div>

          <div className="mt-6 border-b border-gray-200 flex justify-between">
            <div className="flex space-x-1 flex">
              <button
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 flex items-center ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Unread
                {pendingCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === "seen"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("seen")}
              >
                Read
              </button>
            </div>
            <button
              onClick={markAllAsRead}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap flex justify-end"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              Mark all as read
            </button>
          </div>

          <div className="mt-3 flex space-x-2">
            <button
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                activeSubTab === "All"
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveSubTab("All")}
            >
              All Types
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 flex items-center ${
                activeSubTab === "Notification"
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveSubTab("Notification")}
            >
              <FontAwesomeIcon icon={faBell} className="mr-1" />
              Notifications
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 flex items-center ${
                activeSubTab === "Reminder"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveSubTab("Reminder")}
            >
              <FontAwesomeIcon icon={faClockRotateLeft} className="mr-1" />
              Reminders
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 flex items-center ${
                activeSubTab === "Alert"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveSubTab("Alert")}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1" />
              Alerts
            </button>
          </div>

          <div className="mt-4 border border-gray-200 rounded-md overflow-hidden max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div>
                {filteredNotifications.map((notification: Notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    markAsRead={markAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="mb-4 p-4 rounded-full bg-gray-100">
                  <FontAwesomeIcon
                    icon={faEye}
                    className="text-gray-400 text-2xl"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-800">
                  No notifications found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search or filter criteria"
                    : activeTab === "pending"
                    ? "You're all caught up!"
                    : "No notifications to display"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;
