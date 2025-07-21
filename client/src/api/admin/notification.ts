import axios from "axios";
import axiosInstance from "../axiosInstance"



export const getAllNotification = async (token: string | null, id: string | undefined) => {
    try {
        const response = await axiosInstance.get(`/notification/${id}`, {
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

export const markAsReadNotificaiton = async (token: string | null, id: string | undefined) => {
    try {
        const response = await axiosInstance.put(`/notification/markAsRead`, {
            id: id
        },
            {
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

export const markAllAsReadNotification = async (token: string | null, id: string | undefined) => {
    try {
        const response = await axiosInstance.put(`/notification/markAllAsRead`, {
            id: id
        },
            {
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