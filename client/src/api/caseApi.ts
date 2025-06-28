import axios from "axios";
import axiosInstance from "./axiosInstance";


export const createCase = async (newCase: {
    title: string,
    clientName: string,
    caseType: string,
    priority: string,
    nextHearingDate: string,
    description: string,
    hearingHistory: string[]
}, token: string | null) => {
    try {
        const response = await axiosInstance.post('/case', newCase, {
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

export const getAllCase = async (token: string | null, userId: string | undefined) => {
    try {
        const response = await axiosInstance.get(`/case/${userId}`, {
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

export const updateCase = async (newCase: {
    _id?: string
    title: string,
    clientName: string,
    caseType: string,
    priority: string,
    nextHearingDate: string,
    description: string,
    hearingHistory: string[]
}, token: string | null) => {
    try {
        const response = await axiosInstance.put(`/case/${newCase._id}`, newCase, {
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


export const deleteCase = async (caseId: string, token: string | null) => {
    try {
        const response = await axiosInstance.delete(`/case/${caseId}`, {
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

export const updateHearing = async (caseId: string , hearingEntry: string, token: string | null) => {
    try {
        console.log(hearingEntry)
        const response = await axiosInstance.put(`/case/updateHearing/${caseId}`, { hearingEntry }, {
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
};