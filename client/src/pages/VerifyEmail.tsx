import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api/authApi";
import { BeatLoader } from "react-spinners";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState({
    message: "Verifying your email...",
    isError: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!token) {
        setStatus({
          message: "Invalid or missing verification token.",
          isError: true,
          isLoading: false,
        });
        return;
      }

      try {
        const response = await verifyEmail(token);

        if (response.status === 201) {
          setStatus({
            message: "Email verified successfully! Redirecting to login...",
            isError: false,
            isLoading: false,
          });
          setTimeout(() => navigate("/signup"), 1000);
        } else {
          throw new Error("Verification failed");
        }
      } catch (error) {
        setStatus({
          message: "Failed to verify email. Please try again or contact support.",
          isError: true,
          isLoading: false,
        });
        console.error("Verification error:", error);
      }
    };

    verifyUserEmail();
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        {status.isLoading ? (
          <BeatLoader color="#3b82f6" size={15} />
        ) : (
          <span
            className={`text-5xl mb-4 block ${
              status.isError ? "text-red-500" : "text-green-500"
            }`}
          >
            {status.isError ? "✗" : "✓"}
          </span>
        )}
        <h2
          className={`text-2xl font-medium ${
            status.isError ? "text-red-500" : "text-gray-800"
          }`}
        >
          {status.message}
        </h2>
      </div>
    </div>
  );
};

export default VerifyEmail;