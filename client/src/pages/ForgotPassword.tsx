import { useEffect, useState } from "react";
import logo from '../assets/COURTMATE_Black.png';
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { forgetResetPassword, sendForgotPasswordMail } from "@/api/authApi";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface TokenPayload {
  email: string;
}

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [isSending, setIsSending] = useState(false);

  const navigate = useNavigate();

  const handleForgotButton = async () => {
    setIsSending(true);
    const response = await sendForgotPasswordMail(email);
    try {
      if (response.status === 200) {
        toast.success(
          response.data.message || "Verification Mail Sent successfully"
        );
      } else {
        toast.error(
          response.data.error || "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong, Please check your connection.");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let error = params.get("error");
    const token = params.get("token");
    const stepFromUrl = params.get("step");

    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        if (decoded.email) {
          setEmail(decoded.email);
        }
      } catch (e) {
        console.log(e)
        toast.error("Invalid token");
      }
    }

    if (stepFromUrl) {
      setStep(Number(stepFromUrl));
    }

    if (error) {
      toast.error(error);
    }
    error = "";
  }, []);

  const submitNewPassword = async () => {

    if(!password || !cPassword){
      return toast.error('All fields are required')
    }
    if (password.length < 8) {
      return toast.error("Password wants atleast 8 letters");
    }

    if (password !== cPassword) {
      return toast.error("password do not match");
    }
    setIsSending(true); // 🔒 Disable button
    try {
      const response = await forgetResetPassword(password, email);
      if (response.status === 200) {
        toast.success(response.data.message || "Password updated successfully");
        setPassword("");
        setCPassword("");
        setEmail("");
        setStep(1);
        navigate("/forgot-Password", { replace: true });
      } else {
        toast.error(response.data.error || "Error occurred");
      }
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong, please try again");
    } finally {
      setIsSending(false); // 🔓 Re-enable button after request
    }
  };

  const backTosignup = () => {
    navigate('/signup')
  }

  if (step === 1) {
    return (
      <div className="relative w-screen h-screen">
        <div className="absolute top-0 p-10  ">
          <img src={logo} alt="Logo" className="w-20 md:w-48 xl:w-80" />
        </div>
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex flex-col justify-cente relative justify items-center">
            <h1 className="text-black font-poppins  text-md md:text-xl xl:text-3xl">
              Forgot Password?
            </h1>
            <p className="mt-1 mb-4 text-sm ">
              Enter Your Registered Email Here..
            </p>
            <Input
              type="email"
              placeholder="Enter Your Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full md:w-80 h-full md:h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <p className="text-center leading-tight mt-4">
              We have send a verification mail into your Email.
            </p>
            <p className="text-center mb-6">Please verify your Email</p>
            <Button
              type="submit"
              onClick={handleForgotButton}
              label={isSending ? "Sending..." : "Send Mail"}
              className="w-48"
              disabled={isSending}
              />
              <p className="text-sm text-blue-500 cursor-pointer py-2" onClick={backTosignup}>&larr; Back to signup</p>  
          </div>
        </div>
      </div>
    );
  } else if (step === 2) {
    return (
      <div className="relative w-screen h-screen">
        <div className="absolute top-0 p-10">
          <img src={logo} alt="Logo" className="w-20 md:w-48 xl:w-80" />
        </div>
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center relative items-center">
            <h1 className="text-black font-poppins text-md md:text-xl xl:text-3xl">
              Change Password
            </h1>

            {/* Display entered email */}
            {email && (
              <p className="mt-2 text-gray-800 text-xs md:text-xl xl:text-lg">
                <span className="font-semibold">
                  Verification mail send to this Email:
                </span>{" "}
                {email}
              </p>
            )}

            <p className="mt-1 mb-4 text-sm">Enter Your new password here</p>
            <Input
              type="password"
              placeholder="Enter Your password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full md:w-80 h-full md:h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <Input
              type="password"
              placeholder="Confirmation Password"
              name="cPassword"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              className="w-full md:w-80 h-full md:h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <p className="text-center m-4">
              Make sure you have given a strong and unforgettable password.
            </p>
            <p className="text-center mb-2">Confirm Your Password</p>
            <Button
              type="submit"
              onClick={submitNewPassword}
              label={isSending ? "Confirming..." : "Confirm"}
              className="w-48"
              disabled={isSending}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default ForgotPassword;
