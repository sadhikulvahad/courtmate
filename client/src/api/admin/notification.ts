import axiosInstance from "../axiosInstance"



export const getAllNotification = async (token: string | null, id: string | undefined) => {
    try {
        const response = await axiosInstance.get(`/notification/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response
    } catch (error) {
        console.log('Error from get All notification API', error)
    }
}

export const markAsReadNotificaiton = async (token: string | null, id: string | undefined) => {
    try {
        const response = await axiosInstance.put(`/notification/markAsRead`, {
            id: id
        },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        return response
    } catch (error) {
        console.log('Error from Mark as read notification API', error)
    }
} 

export const markAllAsReadNotification = async (token: string | null, id: string | undefined) => {
    try {
        const response = await axiosInstance.put(`/notification/markAllAsRead`, {
            id: id
        },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        return response
    } catch (error) {
        console.log('Error from Mark All as read notification API', error)
    }
}