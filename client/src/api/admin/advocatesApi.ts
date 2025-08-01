
// import axioInstance from "../axiosInstance";

import axios from "axios"
import axiosInstance from "../axiosInstance";

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
}, token: string | null) => {
    try {
        const params = {
            page,
            limit,
            ...(searchTerm ? { searchTerm } : {}),
            ...(activeTab ? { activeTab } : {}),
        };

        const response = await axiosInstance.get("/admin/advocate/getAdvocates", {
            params,
            headers: {
                Authorization: `Bearer ${token}`
            }
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

