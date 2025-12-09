import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,  
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshRes = await axios.get(API_BASE_URL+"/auth/refresh", {
          withCredentials: true,
        });

        const newAccessToken = refreshRes.data.accessToken;

        useAuth().updateAccessToken(newAccessToken);

        return api(original);
      } catch {
        await axios.get("/auth/logout", { withCredentials: true }).catch(() => {
          
        });
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;
