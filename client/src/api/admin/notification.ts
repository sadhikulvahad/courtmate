import axios from "axios";
import axiosInstance from "../axiosInstance"
import { API_ENDPOINTS } from "../Routes/endpoint";



export const getAllNotification = async (id: string | undefined) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATION.NOTIFICATION_GET, {
            params: { id }
        });
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

export const markAsReadNotificaiton = async (id: string | undefined) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.NOTIFICATION.NOTIFICATION_MARKASREAD, {
            id: id
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

export const markAllAsReadNotification = async (id: string | undefined) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.NOTIFICATION.NOTIFICATION_MARKALLASREAD, {
            id: id
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