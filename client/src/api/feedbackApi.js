import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/feedback";

export const sendFeedbackApi = (payload, token) =>
  axios.post(API_BASE_URL, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
