import Input from "../components/ui/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faArrowLeft,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import google from "../assets/google-logo.png";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { initiateGoogleAuth, loginUser, signupUser } from "../api/authApi";
import Button from "../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/features/authSlice";
import { RootState } from "@/redux/store";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Loader from "@/components/ui/Loading";

interface MyTokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
}

export function Signup() {
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupDetails, setSignupDetails] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "",
  });
  const [cPassword, setCPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const email = params.get("email") || "";
    const error = params.get("error");

    if (error) {
      toast.error(error || "Authentication failed");
    }

    if (token) {
      const decoded = jwtDecode<MyTokenPayload>(token);
      const user = {
        email: email,
        id: decoded?.id,
        name: decoded?.name,
        role: decoded?.role,
      };
      dispatch(
        loginSuccess({
          user: user,
          token: token,
        })
      );
    }
  }, [isSubmitting, dispatch, location]);

  useEffect(() => {
    if (user?.role === "user" && isAuthenticated) {
      navigate("/");
    } else if (user?.role === "advocate" && isAuthenticated) {
      navigate("/adv/dashboard");
    } else if (user?.role === "admin" && isAuthenticated) {
      navigate("/adm/dashboard");
    }
  }, [user, navigate, isAuthenticated]);

  const handleStepChange = (newStep: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const role = step === 2 ? "user" : step === 3 ? "advocate" : "";

    // Create updated signup details with role
    const updatedSignupDetails = {
      ...signupDetails,
      role: role,
    };

    if (step === 2 || step === 3) {
      if (
        !updatedSignupDetails.name ||
        !updatedSignupDetails.email ||
        !updatedSignupDetails.phone ||
        !updatedSignupDetails.password ||
        !cPassword ||
        !updatedSignupDetails.role
      ) {
        setIsSubmitting(false);
        return toast.error("All fields are required");
      }

      if (cPassword !== updatedSignupDetails.password) {
        setIsSubmitting(false);
        return toast.error("Passwords do not match");
      }
      if (updatedSignupDetails.phone.length !== 10) {
        setIsSubmitting(false);
        return toast.error("Mobile number must be 10 digits");
      }
      if (updatedSignupDetails.password.length < 8) {
        setIsSubmitting(false);
        return toast.error("Password must be at least 6 characters");
      }

      try {
        const response = await signupUser(updatedSignupDetails);
        if (response?.status == 201 || response?.status == 202) {
          setShowModal(true);
          toast.success(response.data.message);
        } else {
          setShowModal(false);
          toast.error(
            response?.data?.error || "Signup failed. Please try again."
          );
        }
      } catch (error: unknown) {
        setShowModal(false);
        setIsSubmitting(false);
        let errorMessage = "Signup failed";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        toast.error(errorMessage);
      }
    } else {
      if (!updatedSignupDetails.email || !updatedSignupDetails.password) {
        setIsSubmitting(false);
        return toast.error("All fields are required");
      }

      try {
        const response = await loginUser({
          email: updatedSignupDetails.email,
          password: updatedSignupDetails.password,
        });

        if (response.status === 200) {
          dispatch(
            loginSuccess({
              user: response.data.user,
              token: response.data.token,
            })
          );
          toast.success(response.data.message || "Logged successfully");
          setIsSubmitting(false);
        } else {
          setIsSubmitting(false);

          toast.error(response.data.message || "Loggin failed");
        }
      } catch (error: unknown) {
        setIsSubmitting(false);
        let errorMessage = "Login failed";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        toast.error(errorMessage);
      }
    }
    setIsSubmitting(false);
  };

  const handleSignupDetails = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSignupDetails((prev) => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleGoogleSignup = async () => {
    // const role = 'user'
    await initiateGoogleAuth();
  };

  const handleForgotButton = () => {
    navigate("/forgot-password");
  };

  const navigateHome = () => {
    navigate("/");
  };

  if (isSubmitting) {
    return <Loader />;
  }

  return (
    <>
      <div className="w-full min-h-screen relative overflow-hidden bg-gradient-to-r from-blue-50 to-gray-100">
        {/* Left Panel - Hidden on mobile */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-white transition-transform duration-500 ease-in-out hidden md:block ${
            step === 2 || step === 3 ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <img
                src="src/assets/COURTMATE_Black.png"
                alt="CourtMate Logo"
                className="w-64 lg:w-80 mb-2"
                onClick={navigateHome}
              />
              <p className="text-md lg:text-xl font-semibold text-black mb-2 font-poppins">
                Your Trusted Legal Platform
              </p>
            </div>
            <div className="mt-32 text-center">
              <p className="text-md md:text-xl font-semibold text-black">
                ARE YOU AN ADVOCATE?
              </p>
              <div className="hover:underline flex justify-end">
                <p
                  className="text-md md:text-xl md:text-black cursor-pointer flex items-center justify-center"
                  onClick={() => setStep(3)}
                >
                  Register
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    className="ml-3 mt-1.5 w-4"
                  />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Logo - Only visible on mobile */}
        <div className="flex flex-col items-center pt-8 pb-4 md:hidden">
          <img
            src="src/assets/COURTMATE_Black.png"
            alt="CourtMate Logo"
            className="w-40 mb-2"
            onClick={navigateHome}
          />
          <p className="text-sm font-semibold text-black font-poppins">
            Your Trusted Legal Platform
          </p>
        </div>

        {/* Right Panel - Adjusted for mobile */}
        <div
          className={`md:absolute md:top-0 md:right-0 md:w-1/2 w-full h-full transition-transform duration-500 ease-in-out ${
            step === 2 || step === 3
              ? "md:-translate-x-full"
              : "md:translate-x-0"
          }`}
        >
          <div className="w-full h-full flex items-center justify-center px-4 md:px-0">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg w-full max-w-md md:w-96">
              {step === 2 ? (
                <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center text-gray-800 font-poppins">
                  Signup
                </h2>
              ) : step === 3 ? (
                <h2 className="text-xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-800 font-poppins">
                  Advocate Signup
                </h2>
              ) : (
                <h2 className="text-xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-800 font-poppins">
                  Login
                </h2>
              )}
              <div className="space-y-4">
                {step !== 1 && (
                  <Input
                    type="text"
                    placeholder="Full name"
                    name="name"
                    value={signupDetails.name}
                    onChange={handleSignupDetails}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={signupDetails.email}
                  onChange={handleSignupDetails}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {step !== 1 && (
                  <Input
                    type="number"
                    name="phone"
                    value={signupDetails.phone}
                    onChange={handleSignupDetails}
                    placeholder="Number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <Input
                  type="password"
                  name="password"
                  value={signupDetails.password}
                  onChange={handleSignupDetails}
                  placeholder="Password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {step !== 1 && (
                  <Input
                    type="password"
                    name="cPassword"
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {step === 1 && (
                <div
                  className="text-sm mt-2 flex justify-end cursor-pointer hover:underline text-blue-600"
                  onClick={handleForgotButton}
                >
                  <p>Forgot password?</p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  label={
                    step === 1
                      ? "Login"
                      : step === 2
                      ? "Signup"
                      : "Register as Advocate"
                  }
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                    isSubmitting
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-gray-800 hover:bg-black"
                  }`}
                />
              </div>

              {step !== 3 && (
                <>
                  <div className="flex items-center justify-center my-4">
                    <span className="text-gray-500 text-sm">OR</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors w-full md:w-auto"
                      onClick={() => handleGoogleSignup()}
                    >
                      <img
                        src={google}
                        alt="Google Logo"
                        className="w-5 h-5 mr-2"
                      />
                      <span>Sign up with Google</span>
                    </button>
                  </div>
                </>
              )}

              <div className="mt-6 text-center">
                {step === 2 ? (
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleStepChange(1)}
                    >
                      Log in
                    </span>
                  </p>
                ) : step === 3 ? (
                  <p className="text-sm text-gray-600">
                    <span
                      className="text-blue-600 hover:underline cursor-pointer flex items-center justify-center"
                      onClick={() => handleStepChange(2)}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                      Back to User Signup
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleStepChange(2)}
                    >
                      Signup
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Advocate Section - Only visible on mobile */}
          {(step === 1 || step === 2) && (
            <div className="flex flex-col items-center mt-8 mb-12 md:hidden">
              <p className="text-xl font-semibold text-black mb-2">
                ARE YOU AN ADVOCATE?
              </p>
              <p
                className="text-xl text-black cursor-pointer flex items-center justify-center hover:underline"
                onClick={() => setStep(3)}
              >
                Register
                <FontAwesomeIcon icon={faAngleDown} className="ml-2" />
              </p>
            </div>
          )}
        </div>

        {/* Email Verification Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 max-w-md w-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-blue-500 text-3xl"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Verify Your Email
                </h2>
                <p className="text-gray-600 mb-2">
                  We've sent a verification email to:
                </p>
                <p className="text-blue-600 font-medium mb-6">
                  {signupDetails.email}
                </p>
                <p className="text-gray-600 mb-8">
                  Please check your inbox and click the verification link to
                  complete your registration.
                </p>
                <p className="text-gray-600">
                  The verification mail will expire after 1 minut
                </p>
                <div className="flex flex-col w-full gap-3">
                  <Button
                    label="I'll verify later"
                    onClick={closeModal}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  />
                  <Button
                    label="Go to Login"
                    onClick={() => {
                      closeModal();
                      handleStepChange(1);
                    }}
                    className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-black transition-colors font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Signup;
