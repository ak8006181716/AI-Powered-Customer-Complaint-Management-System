import axios from 'axios';
import { Complaint, ChatResponse, DocumentUploadResponse } from '../types/complaint';

const API_BASE = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const complaintApi = {
  sendChatMessage: async (message: string, complaintId?: string): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/chat', {
      message,
      complaint_id: complaintId,
    });
    return response.data;
  },

  uploadDocument: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<DocumentUploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getComplaints: async (): Promise<Complaint[]> => {
    const response = await apiClient.get<Complaint[]>('/complaints');
    return response.data;
  },

  getComplaintById: async (id: string): Promise<Complaint> => {
    const response = await apiClient.get<Complaint>(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (complaint: Partial<Complaint>): Promise<Complaint> => {
    const response = await apiClient.post<Complaint>('/complaints', complaint);
    return response.data;
  },

  updateComplaint: async (id: string, complaint: Partial<Complaint>): Promise<Complaint> => {
    const response = await apiClient.put<Complaint>(`/complaints/${id}`, complaint);
    return response.data;
  },
};
