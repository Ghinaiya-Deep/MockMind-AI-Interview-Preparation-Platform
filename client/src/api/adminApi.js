import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/admin";

const adminAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const adminLoginApi = (payload) =>
  axios.post(`${API_BASE_URL}/login`, payload);

export const adminLogoutApi = (token) =>
  axios.post(`${API_BASE_URL}/logout`, {}, adminAuthHeaders(token));

export const getAdminMeApi = (token) =>
  axios.get(`${API_BASE_URL}/me`, adminAuthHeaders(token));

export const getDashboardStatsApi = (token) =>
  axios.get(`${API_BASE_URL}/dashboard-stats`, adminAuthHeaders(token));

export const getChartStatsApi = (token) =>
  axios.get(`${API_BASE_URL}/chart-stats`, adminAuthHeaders(token));

export const getAdminUsersApi = (token) =>
  axios.get(`${API_BASE_URL}/users`, adminAuthHeaders(token));

export const getAdminFeedbacksApi = (token, sort = "latest") =>
  axios.get(`${API_BASE_URL}/feedbacks`, {
    ...adminAuthHeaders(token),
    params: { sort }
  });

export const deleteAdminFeedbackApi = (token, id) =>
  axios.delete(`${API_BASE_URL}/feedbacks/${id}`, adminAuthHeaders(token));

export const getAdminContactsApi = (token) =>
  axios.get(`${API_BASE_URL}/contacts`, adminAuthHeaders(token));

export const deleteAdminContactApi = (token, id) =>
  axios.delete(`${API_BASE_URL}/contacts/${id}`, adminAuthHeaders(token));
