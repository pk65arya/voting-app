import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  setupMFA: () => api.post('/auth/setup-mfa'),
  verifyMFA: (token: string) => api.post('/auth/verify-mfa', { token }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  refreshToken: () => api.post('/auth/refresh-token'),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
  uploadDocument: (formData: FormData) => api.post('/profile/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  verifyProfile: () => api.post('/profile/verify'),
};

export const electionAPI = {
  getElections: () => api.get('/elections'),
  getElection: (id: string) => api.get(`/elections/${id}`),
  getCandidates: (electionId: string) => api.get(`/elections/${electionId}/candidates`),
};

export const votingAPI = {
  generateVoteLink: (electionId: string) => api.post(`/voting/generate-link/${electionId}`),
  verifyVoteLink: (token: string) => api.get(`/voting/verify-link/${token}`),
  submitVote: (data: any) => api.post('/voting/submit', data),
  getVoteStatus: (electionId: string) => api.get(`/voting/status/${electionId}`),
};

export const auditAPI = {
  getAuditLog: (params: any) => api.get('/audit', { params }),
  getVotingStats: () => api.get('/audit/stats'),
};

export const feedbackAPI = {
  submitFeedback: (data: any) => api.post('/feedback', data),
  getFeedback: () => api.get('/feedback'),
};

export const supportAPI = {
  createTicket: (data: any) => api.post('/support/ticket', data),
  getTickets: () => api.get('/support/tickets'),
  updateTicket: (id: string, data: any) => api.put(`/support/tickets/${id}`, data),
};

export default api;