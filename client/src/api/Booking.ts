import { RecurringRule } from '@/types/Types';
import axiosInstance from './axiosInstance';
import axios from 'axios';



export const findUser = async (id: string, token: string | null) => {
  const response = await axiosInstance.get(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRecurringRules = async (advocateId: string, token: string | null) => {

  try {
    const response = await axiosInstance.get(`/recurring`, {
      params: { advocateId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
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

export const addRecurringRule = async (advocateId: string, rule: Omit<RecurringRule, 'id'>, token: string | null) => {
  const response = await axiosInstance.post(
    `/recurring`,
    { advocateId, ...rule },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response;
};

export const getSlots = async (
  advocateId: string,
  month: string,
  token: string | null
) => {
  const response = await axiosInstance.get(`/slot`, {
    params: { advocateId, month },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};

export const addCustomSlot = async (advocateId: string, slot: { date: string; time: string }, token: string | null) => {
  try {
    const response = await axiosInstance.post(
      `/slot`,
      { advocateId, ...slot },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw error;
    }
  }

};

export const bookSlot = async (
  advocateId: string,
  slotId: string,
  userId: string,
  notes: string,
  token: string | null
) => {
  const response = await axiosInstance.post(
    `/booking`,
    { advocateId, slotId, userId, notes },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response;
};

export const getBookings = async (userId: string, token: string | null) => {
  const response = await axiosInstance.get(`/booking`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` }
  }
  );
  return response;
};

export const postPoneBooking = async (date: string, time: string, reason: string, bookId: string, token: string | null) => {
  try {
    const response = await axiosInstance.put(`/booking/postpone`, {
      bookId,
      date,
      time,
      reason
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw error;
    }
  }
}

export const createPayment = async (advocateId: string | undefined, selectedSlotId: string | undefined) => {
  try {
    const response = await axiosInstance.post('/payment/create-checkout-session', { advocateId, selectedSlotId })
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw error;
    }
  }
}

export const verifyRoomBooking = async (roomId: string, token: string | null) => {
  try {
    const response = await axiosInstance.get(`/booking/verify/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw error;
    }
  }
};


export const getBook = async (advocateId: string | null, userId: string | null) => {
  try {
    const response = await axiosInstance.get('/booking/getBook', {
      params: {
        advocateId,
        userId,
      },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw error;
    }
  }
};


export const postponeSlot = async (date: string, time: string, reason: string | undefined, slotId: string, token: string | null) => {
  try {
    const response = await axiosInstance.put(`/slot/${slotId}`, {
      date,
      time,
      reason
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw error;
    }
  }
}

export const GetHostory = async () => {
  try {
    const response = await axiosInstance.get('/booking/callHistory')
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw error;
    }
  }
}