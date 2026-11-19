import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    const message =
      err.response?.data?.message ||
      err.response?.data?.details?.join(", ") ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
