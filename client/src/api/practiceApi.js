import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/practice";

export const generateQuestionsApi = (payload, token) =>
  axios.post(`${API_BASE_URL}/questions`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const uploadAnswerAudioApi = (questionId, audioBlob, token) => {
  const formData = new FormData();
  formData.append("questionId", questionId);
  formData.append("audio", audioBlob, `answer-${questionId}.webm`);
  return axios.post(`${API_BASE_URL}/answers`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });
};

export const evaluateAnswersApi = (payload, token) =>
  axios.post(`${API_BASE_URL}/evaluate`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getChatbotHelpApi = (payload, token) =>
  axios.post(`${API_BASE_URL}/chatbot`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getPracticeSessionsApi = (token) =>
  axios.get(`${API_BASE_URL}/sessions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
