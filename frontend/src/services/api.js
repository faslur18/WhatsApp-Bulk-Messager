import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (if needed in future)
api.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Contact APIs
export const contactAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/contacts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  tagContacts: (data) => api.post('/contacts/tag', data),
  getTags: () => api.get('/contacts/tags'),
};

// Campaign APIs
export const campaignAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  getAnalytics: (id) => api.get(`/campaigns/${id}/analytics`),
};

// WhatsApp APIs
export const whatsappAPI = {
  getTemplates: () => api.get('/whatsapp/templates'),
  generateShareLink: (data) => api.post('/whatsapp/share-link', data),
};

// Analytics APIs
export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getLogs: (params) => api.get('/analytics/logs', { params }),
  getQueueStats: () => api.get('/analytics/queue'),
};

export default api;
