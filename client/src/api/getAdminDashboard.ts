import axios from "axios";
import axiosInstance from "./axiosInstance";


export const getAdminDashboardData = async (token: string | null, adminId: string | undefined) => {
    try {
        const response = await axiosInstance.get(`/adminDashoard/${adminId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response
    } catch (error) {
        if (axios   .isAxiosError(error)) {
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