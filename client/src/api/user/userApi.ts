import axios from "axios";
import axiosInstance from "../axiosInstance"
import { API_ENDPOINTS } from "../Routes/endpoint";


export const findUser = async (id: string | null) => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER.FIND_USER, {
    params: { id }
  });
  return response;
};

export const updateUser = async (userData: FormData) => {
  try {

    const response = await axiosInstance.put(API_ENDPOINTS.USER.UPDATE_USER, userData)
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error from profile update API", error);
      return error.response ?? null;
    } else {
      console.error("Unknown error", error);
      return null;
    }
  }
}



export const BlockUser = async (id: string) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.USER.TOGGLE_USER, { id: id })
    return response
  } catch (error) {
    console.error(error)
  }
}

export const ResetPassword = async (id: string, oldPassword: string, newPassword: string) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.USER.RESET_PASSWORD, { id: id, oldPassword: oldPassword, newPassword: newPassword })
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Error from profile update API", error);
      return error.response ?? null;
    } else {
      console.error("Unknown error", error);
      return null;
    }
  }
}

export const toggleSaveAdvocate = async (advocateId: string) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.USER.TOGGLE_SAVE_ADVOCATE, {}, {
      params : {advocateId}
    })
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error from profile update API", error);
      return error.response ?? null;
    } else {
      console.error("Unknown error", error);
      return null;
    }
  }
}

export const GetSavedAdvocates = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.GET_SAVED_ADVOCATES)
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error from profile update API", error);
      return error.response ?? null;
    } else {
      console.error("Unknown error", error);
      return null;
    }
  }
}
