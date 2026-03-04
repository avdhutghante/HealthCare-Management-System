import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
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

// Response interceptor - Handle errors and update sync status
api.interceptors.response.use(
  (response) => {
    // Update sync status on successful API calls
    if (window.updateSyncStatus) {
      window.updateSyncStatus();
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getPendingApprovals: () => api.get('/admin/pending-approvals'),
  approveUser: (userId) => api.put(`/admin/approve/${userId}`),
  rejectUser: (userId, data) => api.put(`/admin/reject/${userId}`, data),
  deactivateUser: (userId) => api.put(`/admin/deactivate/${userId}`),
  activateUser: (userId) => api.put(`/admin/activate/${userId}`),
};

// Doctor API
export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  // Backwards-compatible alias used in older components/docs
  getAllDoctors: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  updateProfile: (data) => api.put('/doctors/profile', data),
  addReview: (doctorId, data) => api.post(`/doctors/${doctorId}/review`, data),
};

// Lab API
export const labAPI = {
  getAll: (params) => api.get('/labs', { params }),
  getById: (id) => api.get(`/labs/${id}`),
  updateProfile: (data) => api.put('/labs/profile', data),
  addReview: (labId, data) => api.post(`/labs/${labId}/review`, data),
};

// Appointment API
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  // Backwards-compatible alias
  createAppointment: (data) => api.post('/appointments', data),
  getMyAppointments: (params) => api.get('/appointments/my-appointments', { params }),
  getDoctorAppointments: (params) => api.get('/appointments/doctor-appointments', { params }),
  getAvailableSlots: (params) => api.get('/appointments/available-slots', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
  complete: (id, data) => api.put(`/appointments/${id}/complete`, data),
  cancel: (id, data) => api.put(`/appointments/${id}/cancel`, data),
};

// Lab Test API
export const labTestAPI = {
  create: (data) => api.post('/lab-tests', data),
  getMyTests: (params) => api.get('/lab-tests/my-tests', { params }),
  getLabBookings: (params) => api.get('/lab-tests/lab-bookings', { params }),
  getById: (id) => api.get(`/lab-tests/${id}`),
  updateStatus: (id, data) => api.put(`/lab-tests/${id}/status`, data),
  addResults: (id, data) => api.put(`/lab-tests/${id}/results`, data),
  cancel: (id, data) => api.put(`/lab-tests/${id}/cancel`, data),
};

// AI API
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  analyzeSymptoms: (data) => api.post('/ai/analyze-symptoms', data),
  recommendDoctor: (data) => api.post('/ai/recommend-doctor', data),
  explainMedication: (data) => api.post('/ai/explain-medication', data),
  assessHealthRisk: (data) => api.post('/ai/assess-health-risk', data),
  getHealthTips: () => api.get('/ai/health-tips'),
};

// Heart Disease Prediction API
export const heartDiseaseAPI = {
  predict: (data) => api.post('/heart-disease/predict', data),
  getInfo: () => api.get('/heart-disease/info'),
};

export default api;
