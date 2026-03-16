import axios from "axios";

const BASE = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("careconnect_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("careconnect_token");
      localStorage.removeItem("careconnect_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: {
    name: string; email: string; password: string; role: string;
    organization?: string; registrationNo?: string; focusArea?: string;
    website?: string; phone?: string; address?: string;
  }) => api.post("/register", data),

  login: (email: string, password: string) =>
    api.post("/login", { email, password }),

  getMe: () => api.get("/me"),
};

// ─── ADMIN — USERS ──────────────────────────────────────────────────────────
export const adminAPI = {
  getPendingUsers: () => api.get("/users/pending"),
  getAllUsers: () => api.get("/users"),
  approveUser: (id: number) => api.put(`/users/${id}/approve`),
  rejectUser: (id: number) => api.put(`/users/${id}/reject`),
};

// ─── CARE REQUESTS ──────────────────────────────────────────────────────────
export const careAPI = {
  submit: (data: {
    elderName: string; age: number; location: string;
    helpType: string; description: string;
  }) => api.post("/care-requests", data),

  mine: () => api.get("/care-requests/mine"),
  all: () => api.get("/care-requests"),
  pending: () => api.get("/care-requests/pending"),
  approved: () => api.get("/care-requests/approved"),
  approve: (id: number) => api.put(`/care-requests/${id}/approve`),
  reject: (id: number) => api.put(`/care-requests/${id}/reject`),
  accept: (id: number) => api.put(`/care-requests/${id}/accept`),
  complete: (id: number) => api.put(`/care-requests/${id}/complete`),
  assignNgo: (id: number, ngoId: string | number) =>
  api.put(`/care-requests/${id}/assign-ngo`, { ngoId }),
};

// ─── ORPHAN REQUESTS ────────────────────────────────────────────────────────
export const orphanAPI = {
  submit: (data: {
    childName: string; age: number; guardian?: string;
    supportTypes: string[]; description: string;
  }) => api.post("/orphan-requests", data),

  mine: () => api.get("/orphan-requests/mine"),
  all: () => api.get("/orphan-requests"),
  pending: () => api.get("/orphan-requests/pending"),
  approved: () => api.get("/orphan-requests/approved"),
  ngoRequests: () => api.get("/orphan-requests/ngo"),
  approve: (id: number) => api.put(`/orphan-requests/${id}/approve`),
  reject: (id: number) => api.put(`/orphan-requests/${id}/reject`),
  accept: (id: number) => api.put(`/orphan-requests/${id}/accept`),

  // Admin: assign a specific NGO to an approved orphan request
  assignNgo: (id: number, ngoId: string | number) =>
    api.put(`/orphan-requests/${id}/assign-ngo`, { ngoId }),
};

// ─── NGOS ───────────────────────────────────────────────────────────────────
export const ngoAPI = {
  getAll: () => api.get("/ngos"),
};
