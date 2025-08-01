import axios from "axios";
import axiosInstance from "./axiosInstance";


export const CreateConversation = async (participantId: string | undefined, role: string, token: string | null) => {
    try {
        const response = await axiosInstance.post('/conversation', {
            participantId,
            role
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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

export const GetConversation = async (token: string | null) => {
    try {
        const response = await axiosInstance.get('/conversation', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            return error.response?.data ?? null;
        } else {
            console.error("Unknown error", error);
            return null;
        }
    }
}

export const GetMessages = async (id: string, token: string | null) => {
    try {
        const response = await axiosInstance.get(`/conversation/messages/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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