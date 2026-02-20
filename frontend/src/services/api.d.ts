// services/api.ts

import axios from "axios";
import type { ApiService } from "./api.d";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // Important for cookies/auth
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh (optional - implement if needed)
// ...

const apiService: ApiService = {
  auth: {
    signUp: (userData) => api.post("/auth/signup", userData),
    signIn: (credentials) => api.post("/auth/signin", credentials),
    refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
    logout: () => api.post("/auth/logout"),
    forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
    resetPassword: (token, password) =>
      api.post("/auth/reset-password", { token, password }),
    verifyEmail: (email, code) =>
      api.post("/auth/verify-email", { email, code }),
    resendVerification: (email) =>
      api.post("/auth/resend-verification", { email }),
  },

  users: {
    getProfile: () => api.get("/users/profile"),
    updateProfile: (userData) => api.patch("/users/profile", userData),
    deleteAccount: () => api.delete("/users/account"),
    getPreferences: () => api.get("/users/preferences"),
    updatePreferences: (preferences) =>
      api.patch("/users/preferences", preferences),
    getSavedProperties: () => api.get("/users/saved-properties"),
    saveProperty: (propertyId) =>
      api.post(`/users/save-property/${propertyId}`),
    removeSavedProperty: (propertyId) =>
      api.delete(`/users/save-property/${propertyId}`),

    // Admin
    getAllUsers: (params) => api.get("/admin/users", { params }),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    updateUserStatus: (id, status) =>
      api.patch(`/admin/users/${id}/status`, status),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
  },

  properties: {
    getAll: (params) => api.get("/properties", { params }),
    getById: (id) => api.get(`/properties/${id}`),
    getFeatured: () => api.get("/properties/featured"),
    create: (propertyData) => api.post("/properties", propertyData),
    update: (id, propertyData) => api.patch(`/properties/${id}`, propertyData),
    delete: (id) => api.delete(`/properties/${id}`),

    // Use dedicated property image upload route
    uploadImages: (propertyId: string, images: File[]) => {
      const formData = new FormData();
      images.forEach((image) => formData.append("images", image));

      return api.post(`/upload/property-images/${propertyId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    deleteImage: (propertyId, imageId) =>
      api.delete(`/properties/${propertyId}/images/${imageId}`),

    getInquiries: (id) => api.get(`/properties/${id}/inquiries`),
    createInquiry: (id, inquiryData) =>
      api.post(`/properties/${id}/inquiries`, inquiryData),
  },

  search: {
    searchProperties: (params) => api.get("/search", { params }),
    getFilters: () => api.get("/search/filters"),
    getTrending: () => api.get("/search/trending"),
  },

  agents: {
    getAll: (params) => api.get("/agents", { params }),
    getById: (id) => api.get(`/agents/${id}`),
    getVerified: () => api.get("/agents/verified"),
    getBySpecialization: (specialization) =>
      api.get(`/agents/specialization/${specialization}`),
    getStats: () => api.get("/agents/stats"),
    apply: (applicationData) => api.post("/agents/apply", applicationData),
    getApplications: (params) =>
      api.get("/admin/agent-applications", { params }),
    getApplicationById: (id) => api.get(`/admin/agent-applications/${id}`),
    approveApplication: (id) =>
      api.patch(`/admin/agent-applications/${id}/approve`),
    rejectApplication: (id, reason) =>
      api.patch(`/admin/agent-applications/${id}/reject`, { reason }),
  },

  chat: {
    getConversations: () => api.get("/chat/conversations"),
    getMessages: (chatId) => api.get(`/chat/conversations/${chatId}/messages`),
    sendMessage: (chatId, message) =>
      api.post(`/chat/conversations/${chatId}/messages`, message),
    createChat: (agentId, propertyId, message) =>
      api.post("/chat/conversations", { agentId, propertyId, message }),
  },

  payments: {
    createPayment: (paymentData) => api.post("/payments", paymentData),
    getPaymentHistory: () => api.get("/payments/history"),
    getPaymentById: (id) => api.get(`/payments/${id}`),
    refundPayment: (id, reason) =>
      api.post(`/payments/${id}/refund`, { reason }),
  },

  notifications: {
    getAll: () => api.get("/notifications"),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch("/notifications/read-all"),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
  },

  upload: {
    uploadImage: (file: File, folder = "kejayangu_properties") => {
      const formData = new FormData();
      formData.append("image", file);
      return api.post("/upload/image", formData);
    },

    uploadImages: (files: File[], folder = "kejayangu_properties") => {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      return api.post("/upload/images", formData); // generic fallback if needed
    },

    uploadDocument: (file: File, folder = "kejayangu_documents") => {
      const formData = new FormData();
      formData.append("document", file);
      return api.post("/upload/document", formData);
    },
  },
};

export { api, apiService };
export default apiService;
