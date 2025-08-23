import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com/api' 
    : '/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Challenge API calls
export const challengeAPI = {
  getAll: () => api.get('/challenges'),
  create: (challengeData) => api.post('/challenges', challengeData),
  join: (challengeId) => api.post(`/challenges/${challengeId}/join`),
};

// Submission API calls
export const submissionAPI = {
  create: (formData) => api.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByChallenge: (challengeId) => api.get(`/submissions?challengeId=${challengeId}`),
  extractSteps: (formData) => api.post('/submissions/extract-steps', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getChallengeParticipants: (challengeId) => api.get(`/admin/challenges/${challengeId}/participants`),
  exportChallenge: (challengeId) => api.get(`/admin/challenges/${challengeId}/export`, {
    responseType: 'blob'
  }),
  getStorageStats: () => api.get('/admin/storage-stats'),
  deleteImages: (challengeId) => api.delete(`/admin/challenges/${challengeId}/images`),
};

export default api;