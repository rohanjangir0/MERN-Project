// src/auth.js
import api, { API_URL } from "./api";

// Use API_URL instead of localhost
export const login = async (email, password, role) => {
  const res = await api.post(`/auth/login`, { email, password, role });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
  }
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};
