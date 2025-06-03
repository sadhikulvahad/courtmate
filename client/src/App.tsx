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
import DashBoard from "./pages/DashBoard";
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
// import Loader from "./components/ui/Loading";

export const socket = io("http://localhost:8080", {
  autoConnect: false, // Prevent auto-connect until user is authenticated
});

function App() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !token) {
      socket.disconnect();
      return;
    }

    socket.auth = { token };
    socket.connect();
    socket.emit("join", user.id);

    socket.on("notification", (data) => {
      console.log("notification", data);
      toast(data.message);
    });

    return () => {
      socket.off("notification");
      socket.disconnect();
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

          <Route element={<ProtectedRoute />}>
            <Route path="/adProfile/:id" element={<AdvocateProfile />} />
            <Route path="/booking/:id" element={<BookingPlatform />} />
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/success/:status" element={<PaymentPages />} />
            <Route path="/cancel/:status" element={<PaymentPages />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/video/:roomId" element={<VideoCallWrapper />} />
            <Route element={<Layout />}>
              <Route path="/users" element={<Users />} />
              <Route path="/AdAdvocates" element={<Advocates />} />
              <Route path="/notification" element={<Notification />} />
              <Route path="/advocate/adProfile" element={<LawyerProfile />} />
              <Route
                path="/advocate/appointments"
                element={<BookingPlatform />}
              />
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
