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
// import Loader from "./components/ui/Loading";

function App() {
  const { user } = useSelector((state: RootState) => state.auth);
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const socket = io("http://localhost:8080");
    socket.emit("join", user?.id);
    socket.on("notification", (data) => {
      console.log("notificaiton", data);
      toast(data.message);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

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

          <Route element={<ProtectedRoute />}>
            <Route path="/adProfile/:id" element={<AdvocateProfile />} />
            <Route path="/booking/:id" element={<BookingPlatform />} />
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/profile" element={<UserProfile />} />
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
