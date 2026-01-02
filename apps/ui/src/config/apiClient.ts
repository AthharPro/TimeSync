import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// 🔐 In-memory access token (no hooks!)
let ACCESS_TOKEN: string | null = null;

// ⭐ Called from AuthContext to sync token
export const setAccessToken = (token: string | null) => {
  ACCESS_TOKEN = token;
};

// Helper function to transform MongoDB _id to id
const transformMongoResponse = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(transformMongoResponse);
  }
  
  if (data && typeof data === 'object') {
    const transformed: any = {};
    
    for (const key in data) {
      if (key === '_id' && !data.id) {
        // Map _id to id if id doesn't exist
        transformed.id = data._id;
        transformed._id = data._id; // Keep original too
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        transformed[key] = transformMongoResponse(data[key]);
      } else {
        transformed[key] = data[key];
      }
    }
    
    return transformed;
  }
  
  return data;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second default timeout
});

// ✨ 1. Add access token to all requests
api.interceptors.request.use((config) => {
  if (ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  return config;
}, (error) => {
  console.error('API Request Interceptor Error:', error);
  return Promise.reject(error);
});

// ✨ 2. Handle refresh token logic and transform MongoDB responses
api.interceptors.response.use(
  (res) => {
    // Transform _id to id in response data, but skip for blob responses
    if (res.data && res.config.responseType !== 'blob') {
      res.data = transformMongoResponse(res.data);
    }
    return res;
  },

  async (err) => {
    console.error('API Response Interceptor Error:', {
      url: err.config?.url,
      status: err.response?.status,
      message: err.message,
      code: err.code,
    });
    const original = err.config;

    // Token expired → try refresh
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshRes = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const newAccessToken = refreshRes.data.accessToken;

        // ⭐ Update in-memory token
        setAccessToken(newAccessToken);

        // Retry original request with new token
        return api(original);
      } catch (refreshErr) {
        console.error("Refresh token failed", refreshErr);

        // Logout if refresh also fails
        await axios.get(`${API_BASE_URL}/auth/logout`, {
          withCredentials: true,
        });

        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;
