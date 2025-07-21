import axios, { AxiosRequestConfig } from 'axios';
import { store } from '@/redux/store'; // Adjust based on your store setup
import { logout, setToken } from '@/features/authSlice';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<(token: string) => void> = [];

axiosInstance.interceptors.response.use(
  (response) => {
    const fresh = response.headers['x-access-token'];
    if (fresh) {
      store.dispatch(setToken(fresh));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${fresh}`;
    }
    return response;
  },

  async (error) => {

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    console.log(error.response.data)
    if (
      error.response?.status === 403 &&
      ((error.response.data as { message?: string })?.message === 'Account is blocked' || (error.response.data as { error?: string })?.error === 'Account is blocked')
    ) {
      store.dispatch(logout());
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          failedQueue.push((newAccessToken: string) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newAccessToken}`,
            };
            store.dispatch(setToken(newAccessToken));
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data, headers } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, null, {
          withCredentials: true,
        });
        const newAccessToken = headers['x-access-token'] || data.accessToken;
        store.dispatch(setToken(newAccessToken));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        failedQueue.forEach((callback) => callback(newAccessToken));
        failedQueue = [];

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(setToken(null));
        document.cookie = 'refreshToken=; Max-Age=0; path=/;'; // Clear cookie
        window.location.href = '/signup';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;