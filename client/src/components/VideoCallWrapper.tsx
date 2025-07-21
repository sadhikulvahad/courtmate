// src/components/VideoCallWrapper.tsx
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import VideoCall from "@/pages/VideoCall";
import { verifyRoomBooking } from "@/api/booking";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import axios from "axios";

const VideoCallWrapper = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsAuthorized(false);
      setErrorMessage("You must be logged in to access the video call");
      return;
    }

    const verifyBooking = async () => {
      try {
        const response = await verifyRoomBooking(roomId!, token);
        setIsAuthorized(response?.data?.isAuthorized || false);

        if (!response?.data?.isAuthorized) {
          const message = response?.data?.message || "Unauthorized access";
          setErrorMessage(message);
          toast.error(message);
        }
      } catch (error: unknown) {
        console.error("Error verifying booking:", error);

        let message = "Failed to verify booking. Please try again.";

        if (axios.isAxiosError(error)) {
          message = error.response?.data?.message || error.message || message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        setIsAuthorized(false);
        setErrorMessage(message);
        toast.error(message);
      }
    };

    verifyBooking();
  }, [roomId, token, isAuthenticated]);

  if (isAuthorized === null) return <div>Loading...</div>;
  if (!isAuthorized) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2 style={{ color: "#e53e3e" }}>Access Denied</h2>
        <p style={{ margin: "20px 0" }}>{errorMessage}</p>
        <Link
          to="/"
          style={{
            padding: "10px 20px",
            backgroundColor: "#4299e1",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return <VideoCall roomId={roomId || ""} />;
};

export default VideoCallWrapper;
