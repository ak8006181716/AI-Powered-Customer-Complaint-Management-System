import axios from 'axios';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const complaintApi = {
  sendChatMessage: async (message, complaintId) => {
    const response = await apiClient.post('/chat', {
      message,
      complaint_id: complaintId,
    });
    return response.data;
  },

  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getComplaints: async () => {
    const response = await apiClient.get('/complaints');
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (complaint) => {
    const response = await apiClient.post('/complaints', complaint);
    return response.data;
  },

  updateComplaint: async (id, complaint) => {
    const response = await apiClient.put(`/complaints/${id}`, complaint);
    return response.data;
  },
};
