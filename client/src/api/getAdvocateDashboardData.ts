import axios from "axios";
import axiosInstance from "./axiosInstance";


export const getAdvocateDashboardData = async (token: string | null, advocateId: string | undefined) => {
    try {
        const response = await axiosInstance.get(`/advocateDashboard/${advocateId}`, {
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