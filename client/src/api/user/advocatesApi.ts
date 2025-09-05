
// import axioInstance from "../axiosInstance";


import { GetAllUserAdvocatesParams } from "@/types/Types";
import axios from "axios";
import { API_ENDPOINTS } from "../Routes/endpoint";
// import axiosInstance from "../axiosInstance";


export const getAllUserAdvocates = async ({
  page = 1,
  limit = 5,
  searchTerm = '',
  activeTab = 'all',
  sortBy = 'rating',
  sortOrder = 'desc',
  filters = {}
}: GetAllUserAdvocatesParams = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    if (searchTerm) params.append('searchTerm', searchTerm);
    if (activeTab !== 'all') params.append('activeTab', activeTab);

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
      } else if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(API_ENDPOINTS.USER.USER_ADVOCATES, {
      params
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching advocates:", error);
    throw error;
  }
};


export const topRatedAdvocates = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.USER.USER_TOP_RATED)
    return response
  } catch (error) {
    console.error("Error fetching advocates:", error);
    throw error;
  }
}