
// import axioInstance from "../axiosInstance";

import axios from "axios"
import axiosInstance from "../axiosInstance";

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

        const response = await axiosInstance.get("/admin/advocate/getAdvocates", { params });
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



export const SendVerificaton = async (status: string, token: string | null, id: string) => {
    try {
        const response = await axiosInstance.put('/admin/advocate/statusUpdate', { status: status, id }, {
            headers: {
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

