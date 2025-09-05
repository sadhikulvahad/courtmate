
// import axioInstance from "../axiosInstance";

import axios from "axios"
import axiosInstance from "../axiosInstance";
import { API_ENDPOINTS } from "../Routes/endpoint";

export const getAllAdminAdvocates = async ({
    page,
    limit,
    searchTerm,
    activeTab,
}: {
    page: number;
    limit: number;
    searchTerm?: string;
    activeTab?: string;
}) => {
    try {
        const params = {
            page,
            limit,
            ...(searchTerm ? { searchTerm } : {}),
            ...(activeTab ? { activeTab } : {}),
        };

        const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ADMIN_ADVOCATES, {
            params,
        });
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return error.response ?? null;
        } else {
            console.error("Unknown error", error);
            return null;
        }
    }
};



export const SendVerificaton = async (status: string, id: string) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.SEND_VERIFICATION, { status: status, id })
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

