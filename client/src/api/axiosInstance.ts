// src/axiosInstance.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { setToken } from "../features/authSlice";
import { store } from "@/redux/store";

type FailedQueueItem = (token: string) => void;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// 1) Attach the latest access token from Redux to every request
axiosInstance.interceptors.request.use(config => {
  const token = store.getState().auth.token;
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 2) If server chose to send you a new token in a header...
    const fresh = response.headers["x-access-token"];
    if (fresh) {
      store.dispatch(setToken(fresh));
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${fresh}`;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          failedQueue.push((newAccessToken: string) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newAccessToken}`
            };
            store.dispatch(setToken(newAccessToken));
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data, headers } = await axiosInstance.post('/auth/refresh', null, {
          withCredentials: true
        });

        // pull the token either from a header or the JSON body:
        const newAccessToken = headers["x-access-token"] || data.accessToken;
        // persist it
        store.dispatch(setToken(newAccessToken));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        failedQueue.forEach(callback => callback(newAccessToken));
        failedQueue = [];

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(setToken(null));
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
