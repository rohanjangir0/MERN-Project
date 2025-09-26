import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // your backend

export const login = async (email, password, role) => {
  const res = await axios.post(`${API_URL}/login`, { email, password, role });
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
