import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./Routes/endpoint";
import { HearingDetailsProps } from "@/types/Types";


export const createCase = async (newCase: {
    title: string,
    clientName: string,
    caseType: string,
    priority: string,
    nextHearingDate: string,
    description: string,
    hearingHistory: string[]
}) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CASE.CASE_POST, newCase)
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

export const getAllCase = async (userId: string | undefined) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CASE.CASE_GET, {
            params: { userId }
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
}) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.CASE.CASE_PUT, newCase, {
            params: { newCaseID: newCase._id }
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


export const deleteCase = async (caseId: string) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.CASE.CASE_DELETE, {
            params: { caseId }
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

export const updateHearing = async (caseId: string, hearingEntry: string) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.CASE.CASE_UPDATE_HEARING, { hearingEntry }, {
            params: { caseId }
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


export const addHearing = async (hearingData: HearingDetailsProps) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CASE.CASE_ADD_HEARING_DATA, hearingData)
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


export const updateHearingData = async (hearingId: string, hearingData: HearingDetailsProps) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.CASE.CASE_UPDATE_HEARING_DATA, hearingData, {
            params: { hearingId }
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

export const getHearingData = async (caseId: string) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CASE.CASE_GET_HEARING_DATA, {
            params: { caseId }
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


export const deleteHearingData = async (hearingId: string) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.CASE.CASE_DELETE_HEARING_DATA, {
            params: { hearingId }
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