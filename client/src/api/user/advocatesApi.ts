
// import axioInstance from "../axiosInstance";


import { GetAllUserAdvocatesParams } from "@/types/Types";
import axios from "axios";
// import axiosInstance from "../axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getAllUserAdvocates = async ({
  page = 1,
  limit = 5,
  searchTerm = '',
  activeTab = 'all',
  sortBy = 'rating',
  sortOrder = 'desc',
  categories = [],
  location = '',
  minExperience,
  maxExperience,
  languages = [],
  minRating = 0,
  availability = [],
  specializations = [],
  certifications = [],
}: GetAllUserAdvocatesParams = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (searchTerm) params.append('searchTerm', searchTerm);
    if (activeTab !== 'all') params.append('activeTab', activeTab);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (categories.length > 0) params.append('categories', categories.join(','));
    if (location) params.append('location', location);
    if (minExperience) params.append('minExperience', minExperience.toString());
    if (maxExperience) params.append('maxExperience', maxExperience.toString());
    if (languages.length > 0) params.append('languages', languages.join(','));
    if (minRating > 0) params.append('minRating', minRating.toString());
    if (availability.length > 0) params.append('availability', availability.join(','));
    if (specializations.length > 0) params.append('specializations', specializations.join(','));
    if (certifications.length > 0) params.append('certifications', certifications.join(','));

    const response = await axios.get(`${API_URL}/user/advocates/getAdvocates?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching advocates:", error);
    throw error;
  }
};


