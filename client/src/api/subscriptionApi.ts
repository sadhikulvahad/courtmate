import axios from "axios";
import axiosInstance from "./axiosInstance";


export const getSubscription = async (advocateId: string | undefined, token: string | null) => {
    try {
        const response = await axiosInstance.get(`/subscribe/${advocateId}`, {
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

export const getAllSubscription = async (token: string | null) => {
    try {
        const response = await axiosInstance.get(`/subscribe/getAll`, {
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

export const createSubscription = async (subscriptionData: {
    advocateId: string | undefined;
    plan: string;
    price: number;
    billingCycle: string;
    nextBillingDate: string;
}, token: string | null) => {
    try {
        if (!token) throw new Error("Missing token");
        const response = await axiosInstance.post(`/payment/create-subscription-checkout`, subscriptionData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return error.response ?? { status: 500, data: { message: "Unknown error" } };
        }
        console.error("Unknown error", error);
        return { status: 500, data: { message: "Unknown error" } };
    }
};