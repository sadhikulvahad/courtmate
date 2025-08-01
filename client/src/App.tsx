import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import "./App.css";
import { toast, Toaster } from "sonner";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/protectedRoute";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
// import DashBoard from "./pages/DashBoard";
import Users from "./components/ui/admin/Users";
import Layout from "./components/ui/admin/Layout";
import Advocates from "./components/ui/admin/Advocates";
import Notification from "./pages/Notification";
import LawyerProfile from "./pages/LawyerProfile";
import UserProfile from "./pages/UserProfile";
import AdvocateList from "./pages/AdvocateList";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import AdvocateProfile from "./pages/AdvocateProfile";
import BookingPlatform from "./pages/Calendar";
import Bookings from "./pages/Bookings";
import Services from "./components/ui/user/Services";
import VideoCallWrapper from "./components/VideoCallWrapper";
import PaymentPages from "./pages/SuccessOrFailPage";
import Chat from "./pages/Chat";
import AdvocateReviewsPage from "./pages/Review&Rating";
import CaseTracker from "./pages/CaseTrack";
import SavedAdvocates from "./pages/SavedAdvocates";
import AboutPage from "./pages/AboutUs";
import ContactPage from "./pages/ContactUs";
import AdvocateSettings from "./pages/Settings";
import MyActivityPage from "./pages/CallHistory";
import Dashboard from "./components/ui/advocate/Dashboard";
import AdminDashboard from "./pages/AdminDashBoard";
import SubscriptionSuccess from "./components/ui/SubscriptionSuccess";
import SubscriptionCancel from "./components/SubscriptionCancel";
// import Loader from "./components/ui/Loading";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
});

function App() {
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id && token) {
      if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
      }

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        socket.emit("join-user", user.id);
      });

      socket.on("connect_error", (error) => {
        console.error("Connection error:", error.message);
      });

      socket.on("notification", (data) => {
        if (data.receiverId === user.id) {
          toast(data.message, {
            description:
              data.type === "chat" ? "New chat message" : "System notification",
            duration: 5000,
          });
        }
      });
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("notification");
    };
  }, [user?.id, token]);

  // useEffect(() => {
  //   // Simulate loading delay or data fetching
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2500); // 2.5 seconds delay

  //   return () => clearTimeout(timer); // cleanup
  // }, []);

  // if (isLoading) return <Loader />;

  return (
    <>
      {/* {isLoading ? <Loader /> : <Home />} */}
      <Router>
        <Toaster richColors position="bottom-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-Password" element={<ForgotPassword />} />
          <Route path="/advocates" element={<AdvocateList />} />
          <Route path="/services" element={<Services />} />
          <Route path="/aboutUs" element={<AboutPage />} />
          <Route path="/contactUs" element={<ContactPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/adProfile/:id" element={<AdvocateProfile />} />
            <Route path="/booking/:id" element={<BookingPlatform />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/success/:status" element={<PaymentPages />} />
            <Route path="/cancel/:status" element={<PaymentPages />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/video/:roomId" element={<VideoCallWrapper />} />
            <Route path="/savedAdvocate" element={<SavedAdvocates />} />
            <Route path="/activity" element={<MyActivityPage />} />
            <Route
              path="/subscription/success"
              element={<SubscriptionSuccess />}
            />
            <Route
              path="/subscription/cancel"
              element={<SubscriptionCancel />}
            />
            <Route path="/user/notification" element={<Notification />} />
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  user?.role === "advocate" ? <Dashboard /> : <AdminDashboard />
                }
              />
              <Route path="/users" element={<Users />} />
              <Route path="/AdAdvocates" element={<Advocates />} />
              <Route path="/notification" element={<Notification />} />
              <Route path="/advocate/adProfile" element={<LawyerProfile />} />
              <Route
                path="/advocate/appointments"
                element={<BookingPlatform />}
              />
              <Route
                path="/advocate/reviews"
                element={<AdvocateReviewsPage />}
              />
              <Route path="/advocate/cases" element={<CaseTracker />} />
              <Route path="/advocate/settings" element={<AdvocateSettings />} />
            </Route>
          </Route>

          {/* 404 page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
