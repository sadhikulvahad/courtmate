import axios, { AxiosResponse } from "axios"
import axiosInstance from "../axiosInstance";
import { API_ENDPOINTS } from "../Routes/endpoint";

export const completeProfile = async (id: string | undefined) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.ADVOCATE.COMPLETE_PROFILE_DETAILS, {
            params: {
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

export const profileUpdate = async (form: FormData): Promise<AxiosResponse | null> => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.ADVOCATE.UPDATE_PROFILE, form)
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

export const findReviews = async (advocateId: string | undefined) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.REVIEW.REVIEW_GET, {
            params: { advocateId }
        })
        return response
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error from Get reviews API", error);
            return error.response ?? null;
        } else {
            console.error("Unknown error", error);
            return null;
        }
    }
}

export const createReview = async ({
    advocateId,
    userId,
    review,
    rating,
}: {
    advocateId: string | undefined
    userId: string | undefined
    review: string;
    rating: number;
}) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.REVIEW.REVIEW_POST, {
            advocateId,
            userId,
            review: review,
            rating: rating,

        });
        return response
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error from Create reviews API", error);
            return error.response ?? null;
        } else {
            console.error("Unknown error", error);
            return null;
        }
    }
}


export const updateReview = async ({
    reviewId,
    review,
    rating
}: {
    reviewId: string | number
    review: string
    rating: number
}) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.REVIEW.REVIEW_PUT, {
            reviewId,
            review: review,
            rating: rating,
        });
        return response
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error from Create reviews API", error);
            return error.response ?? null;
        } else {
            console.error("Unknown error", error);
            return null;
        }
    }
}

export const deleteReview = async (reviewId: string | undefined) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.REVIEW.REVIEW_DELETE, {
            params: { reviewId }
        });
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error from Delete Review API", error);
            return error.response ?? null;
        } else {
            console.error("Unknown error", error);
            return null;
        }
    }
};
