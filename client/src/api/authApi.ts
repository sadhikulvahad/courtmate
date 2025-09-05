import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./Routes/endpoint";

const API_URL = import.meta.env.VITE_API_URL;

export const signupUser = async (userData: object) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.SIGNUPUSER, userData);
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response;
    } else {
      console.error("Unexpected error", error);
      return { status: 500, data: { error: "Unexpected error occurred" } };
    }
  }
};



export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGINUSER, credentials, {
      withCredentials: true,
    });
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || { error: "Network Error" };
    }
    console.error("Unexpected error:", error);
    throw { error: "An unexpected error occurred" };
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.VERIFYEMAIL, null, {
      params: { token }
    }); return response;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};

export const initiateGoogleAuth = () => {
  window.location.href = `${API_URL}/auth/google`;
};

export const sendForgotPasswordMail = async (email: string) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.SENDFORGOTPASSWORDMAIL, { email })
    return response
  } catch (error) {
    console.error('Error from sendForforgotPasswordMail API', error)
    throw error
  }
}

export const forgetResetPassword = async (password: string, email: string) => {
  try {
    const response = await axios.put(API_ENDPOINTS.AUTH.FORGOTRESETPASSWORD, { password, email })
    return response
  } catch (error) {
    console.error("Error from forgetResetPassword api", error)
    throw error
  }
}

export const logoutApi = async (token: string | null) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUTAPI, { token })
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response;
    } else {
      console.error("Unexpected error", error);
      return { status: 500, data: { error: "Unexpected error occurred" } };
    }
  }
}