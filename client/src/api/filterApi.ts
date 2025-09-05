import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./Routes/endpoint";


export const getAllFilters = async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.FITLER.GET_ALL_FILTER);
    return res.data;
};

export const createFilter = async (name: string, type: string) => {
    const res = await axiosInstance.post(API_ENDPOINTS.FITLER.ADD_FILTER, { name, type });
    return res.data;
};

export const addCategory = async (id: string, category: string) => {
    const res = await axiosInstance.put(API_ENDPOINTS.FITLER.ADD_CATEGORY, { category, id });
    return res.data;
};

export const deleteCategory = async (filterId: string, category: string) => {
    const res = await axiosInstance.put(API_ENDPOINTS.FITLER.DELETE_CAREGORY, {
        filterId,
        category
    });
    return res.data;
};

export const deleteFilter = async (filterId: string) => {
    const res = await axiosInstance.delete(API_ENDPOINTS.FITLER.DELETE_FILTER, {
        params: { filterId }
    });
    return res.data;
};
