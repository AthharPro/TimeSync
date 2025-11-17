import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_URL || '';


const apiClient = axios.create({
  baseURL: API_BASE_URL, 
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

   
    const urlPath = (originalRequest.url || '').toString();
    const isAuthEndpoint = /\/auth\/(login|refresh|password|me)/.test(urlPath);

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        
        await apiClient.get('/auth/refresh');

      
        return apiClient(originalRequest);
      } catch (refreshError) {

        console.error('Session refresh failed:', refreshError);
        try {
       
          await apiClient.get('/auth/logout');
        } catch {
          // Ignore logout errors during session cleanup
        }
      
        if (typeof window !== 'undefined') {
          window.location.assign('/');
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export const getApiBaseURL = () => apiClient.defaults.baseURL || window.location.origin;