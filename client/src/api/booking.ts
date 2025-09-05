import { RecurringRule } from '@/types/Types';
import axiosInstance from './axiosInstance';
import axios from 'axios';
import { API_ENDPOINTS } from './Routes/endpoint';


export const getRecurringRules = async (advocateId: string) => {

  try {
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKING.RECURRING_GET, {
      params: { advocateId }
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

export const addRecurringRule = async (advocateId: string, rule: Omit<RecurringRule, 'id'>) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.BOOKING.RECURRING_POST,
    { advocateId, ...rule },
  );
  return response;
};

export const getSlots = async (
  advocateId: string,
  month: string,
) => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKING.SLOT_GET, {
    params: { advocateId, month }
  });
  return response;
};

export const addCustomSlot = async (advocateId: string, slot: { date: string; time: string }) => {
  try {
    const response = await axiosInstance.post(
      API_ENDPOINTS.BOOKING.SLOT_POST,
      { advocateId, ...slot },
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
) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.BOOKING.BOOKING_POST,
    { advocateId, slotId, userId, notes },
  );
  return response;
};

export const getBookings = async (userId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKING.BOOKING_GET, {
    params: { userId },
  }
  );
  return response;
};

export const getAdvocateBookings = async (userId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKING.ADVOCATE_BOOKING_GET, {
    params: { userId },
  }
  );
  return response;
};

export const postPoneBooking = async (date: string, time: string, reason: string, bookId: string) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.BOOKING.BOOKING_POSTPONE, {
      bookId,
      date,
      time,
      reason
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

export const createPayment = async (
  advocateId: string | undefined,
  selectedSlotId: string | undefined,
  paymentMethod: "wallet" | "stripe" | "",
  bookingType: "followup" | "new" | "",
  caseId: string) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.BOOKING.PAYMENT_CHECKOUT, {
      advocateId,
      selectedSlotId,
      paymentMethod,
      bookingType,
      caseId
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

export const verifyRoomBooking = async (roomId: string) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKING.BOOKING_VERIFY, {
      params: { roomId }
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
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKING.BOOKING_GETBOOK, {
      params: {
        advocateId,
        userId,
      }
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


export const postponeSlot = async (date: string, time: string, reason: string | undefined, slotId: string) => {
  try {
    const response = await axiosInstance.put(
      API_ENDPOINTS.BOOKING.SLOT_PUT,
      { date, time, reason },
      {
        params: { slotId }
      }
    );
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
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKING.HISTORY)
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

export const cancelBooking = async (bookingId: string) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.BOOKING.BOOKING_CANCEL, {}, {
      params: { bookingId }
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