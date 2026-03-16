import axios from 'axios';

// The address of your backend
const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// This automatically adds your login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const careAPI = {
  submit: (data: {
    age: number;
    location: string;
    helpType: string;
    description: string;
  }) => api.post("/care-requests", data),

  mine: () => api.get("/care-requests/mine"),
  all: () => api.get("/care-requests"),
  pending: () => api.get("/care-requests/pending"),
  approved: () => api.get("/care-requests/approved"),
  approve: (id: number) => api.put(`/care-requests/${id}/approve`),
  reject: (id: number) => api.put(`/care-requests/${id}/reject`),
  accept: (id: number) => api.put(`/care-requests/${id}/accept`),
  complete: (id: number) => api.put(`/care-requests/${id}/complete`),
};

export const orphanAPI = {
  submit: (data: {
    childName: string;
    age: number;
    guardian?: string;
    supportTypes: string[];
    description: string;
  }) => api.post("/orphan-requests", data),

  mine: () => api.get("/orphan-requests/mine"),
  all: () => api.get("/orphan-requests"),
  pending: () => api.get("/orphan-requests/pending"),
  approved: () => api.get("/orphan-requests/approved"),
  ngoRequests: () => api.get("/orphan-requests/ngo"),
  approve: (id: number) => api.put(`/orphan-requests/${id}/approve`),
  reject: (id: number) => api.put(`/orphan-requests/${id}/reject`),
  accept: (id: number) => api.put(`/orphan-requests/${id}/accept`),
  assignNgo: (id: number, ngoId: string | number) =>
    api.put(`/orphan-requests/${id}/assign-ngo`, { ngoId }),
};