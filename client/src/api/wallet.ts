import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./Routes/endpoint";


export const GetWallet = async (userId: string) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.WALLET.GET_WALLET,{
            params: { userId }
        })
        return response
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        } else {
            console.error("Unknown error:", error);
            throw error;
        }
    }
}