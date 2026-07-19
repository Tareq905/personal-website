import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// attach admin token automatically if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token && config.url?.includes("/api/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auto-logout on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin") {
        window.location.href = "/admin";
      }
    }
    return Promise.reject(err);
  }
);

export default client;