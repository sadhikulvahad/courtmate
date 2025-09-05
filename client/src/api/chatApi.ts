import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./Routes/endpoint";


export const CreateConversation = async (participantId: string | undefined, role: string) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CONVERSATION.CONVERSATION_POST, {
            participantId,
            role
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

export const GetConversation = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CONVERSATION.CONVERSATION_GET)
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

export const GetMessages = async (id: string) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CONVERSATION.CONVERSATION_GET_MESSAGE, {
            params: {
                id
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