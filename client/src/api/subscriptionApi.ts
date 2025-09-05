import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./Routes/endpoint";


export const getSubscription = async (advocateId: string | undefined) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.SUBSCRIPTION.SUBSCRIPTION_GET, {
            params: {
                advocateId
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

export const getAllSubscription = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.SUBSCRIPTION.SUBSCRIPTION_GET_ALL)
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
}) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.SUBSCRIPTION.SUBSCRIPTION_POST, subscriptionData);
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