import axios, { AxiosResponse } from "axios"
import axiosInstance from "../axiosInstance";


// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const completeProfile = async (id: string | undefined, token: string | null) => {
    try {
        const response = await axiosInstance.get(`/advProfile/details`, {
            headers: {
                Authorization: `Bearer ${token}`
            }, params: {
                id
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

export const profileUpdate = async (form: FormData, token: string): Promise<AxiosResponse | null> => {
    try {
        const response = await axiosInstance.put(`/advProfile/updateAdvProfile`, form,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return response
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error("Error from profile update API", error);
            return error.response ?? null;
        } else {
            console.error("Unknown error", error);
            return null;
        }
    }
}