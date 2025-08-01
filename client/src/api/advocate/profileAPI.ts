import axios, { AxiosResponse } from "axios"
import axiosInstance from "../axiosInstance";

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

export const findReviews = async (advocateId: string | undefined, token: string | null) => {
    try {
        const response = await axiosInstance.get('/review', {
            headers: {
                Authorization: `Bearer ${token}`
            }, params: { advocateId }
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
}, token: string | null) => {
    try {
        const response = await axiosInstance.post("/review", {
            advocateId,
            userId,
            review: review,
            rating: rating,

        },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
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
}, token: string | null) => {
    try {
        const response = await axiosInstance.put("/review", {
            reviewId,
            review: review,
            rating: rating,
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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

export const deleteReview = async (reviewId: string | undefined, token: string | null) => {
    try {
        const response = await axiosInstance.delete(`/review/${reviewId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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
