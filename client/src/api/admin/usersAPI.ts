import axios from "axios";
import axiosInstance from "../axiosInstance";
 
export const getAllUsers = async (token: string | null) => {
    try {
        const response = await axiosInstance.get(`/admin/user/getUsers`,{
            headers:{
                Authorization :`Bearer ${token}`
            },
            withCredentials : true
        })
        return response
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            return error.response ?? null;
        } else {
            console.error("Unknown error", error);
            return null;
        }
    }
}