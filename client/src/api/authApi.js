import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth";

export const registerApi = (payload) =>
  axios.post(`${API_BASE_URL}/register`, payload);

export const loginApi = (payload) =>
  axios.post(`${API_BASE_URL}/login`, payload);

export const getProfileApi = (token) =>
  axios.get(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

