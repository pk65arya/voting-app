import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005/api/v1';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
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

// Auth API methods
export const authAPI = {
  register: (data: { email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  verifyMFA: (data: { token: string }) =>
    api.post('/auth/verifyMfa', data),
  
  verifyEmail: (token: string) =>
    api.get(`/auth/verify/${token}`),
  
  getMe: () =>
    api.get('/auth/getMe'),
  
  logout: () =>
    api.get('/auth/logout'),
  
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgotPassword', data),
  
  resetPassword: (token: string, data: { password: string }) =>
    api.put(`/auth/resetpassword/${token}`, data),
};

// Elections API methods
export const electionsAPI = {
  getElections: () =>
    api.get('/elections'),
  
  createElection: (data: any) =>
    api.post('/elections', data),
};

// Votes API methods
export const votesAPI = {
  generateVotingLink: (data: { electionId: string }) =>
    api.post('/votes/generate-link', data),
  
  castVote: (token: string, data: { candidateId: string }) =>
    api.post(`/votes/cast/${token}`, data),
  
  getMyVotes: () =>
    api.get('/votes/my-votes'),
};

// Profile API methods
export const profileAPI = {
  getProfile: () =>
    api.get('/profile'),
  
  updateProfile: (data: any) =>
    api.put('/profile', data),
  
  uploadDocument: (formData: FormData) =>
    api.post('/profile/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default api;