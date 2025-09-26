// src/api.js
import axios from "axios";

// Base URL of your Render backend
export const API_URL = "https://mern-project-v3eg.onrender.com/api"; 

// You can also create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

export default api;
