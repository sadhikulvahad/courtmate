import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./Routes/endpoint";


export const getAdvocateDashboardData = async (advocateId: string | undefined) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.ADVOCATE.DASHBOARD, {
            params : {advocateId}
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