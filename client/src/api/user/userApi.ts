import axios from "axios";
import axiosInstance from "../axiosInstance"


export const findUser = async (id: string | null, token: string | null) => {
  const response = await axiosInstance.get(`/advProfile/getUser/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const updateUser = async (userData: FormData, token: string | null) => {
  try {

    const response = await axiosInstance.put(`/advProfile/updateAdvocate`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
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



export const BlockUser = async (id: string, token: string | null) => {
  try {
    const response = await axiosInstance.put('/user/toggleUser', { id: id }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response
  } catch (error) {
    console.error(error)
  }
}

export const ResetPassword = async (id: string, token: string | null, oldPassword: string, newPassword: string) => {
  try {
    const response = await axiosInstance.put('user/resetPassword', { id: id, oldPassword: oldPassword, newPassword: newPassword }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
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
    const response = await axiosInstance.put(`/user/toggleSave/${advocateId}`)
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
    const response = await axiosInstance.get('/user/savedAdvocates')
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
