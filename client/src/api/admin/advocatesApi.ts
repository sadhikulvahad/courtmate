
// import axioInstance from "../axiosInstance";

import axios from "axios"
import axiosInstance from "../axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
 
export const getAllAdminAdvocates = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/admin/advocate/getAdvocates`)
        return response
    } catch (error) {
        console.error("Error from admin get all users API ", error)
    }
}

export const SendVerificaton = async (status : string, token: string | null, id: string) => {
    try {
        const response = await axiosInstance.put('/admin/advocate/statusUpdate', {status: status, id}, {
            headers: {
                Authorization : `Bearer ${token}`
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

