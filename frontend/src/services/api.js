import axios from "axios";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await api.post("/auth/refresh", {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/auth/signin";
        }
      }
    }
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Authentication
  auth: {
    signUp: (userData) => api.post("/auth/register", userData),
    signIn: (credentials) => api.post("/auth/login", credentials),
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

  // Users
  users: {
    getProfile: () => api.get("/users/profile"),
    updateProfile: (userData) => api.put("/users/profile", userData),
    deleteAccount: () => api.delete("/users/profile"),
    getPreferences: () => api.get("/users/preferences"),
    updatePreferences: (preferences) =>
      api.put("/users/preferences", preferences),
    getSavedProperties: () => api.get("/users/saved-properties"),
    saveProperty: (propertyId) =>
      api.post("/users/saved-properties", { propertyId }),
    removeSavedProperty: (propertyId) =>
      api.delete(`/users/saved-properties/${propertyId}`),
    // Admin functions
    getAllUsers: (params) => api.get("/users", { params }),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUserStatus: (id, status) => api.put(`/users/${id}/status`, status),
    deleteUser: (id) => api.delete(`/users/${id}`),
  },

  // Properties
  properties: {
    getAll: (params) => api.get("/properties", { params }),
    getById: (id) => api.get(`/properties/${id}`),
    getFeatured: () => api.get("/properties/featured"),
    create: (propertyData) => api.post("/properties", propertyData),
    update: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
    delete: (id) => api.delete(`/properties/${id}`),
    uploadImages: (id, images) => {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("images", image);
      });
      return api.post(`/properties/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    deleteImage: (propertyId, imageId) =>
      api.delete(`/properties/${propertyId}/images/${imageId}`),
    getInquiries: (id) => api.get(`/properties/${id}/inquiries`),
    createInquiry: (id, inquiryData) =>
      api.post(`/properties/${id}/inquiries`, inquiryData),
  },

  // Search
  search: {
    searchProperties: (params) => api.get("/search", { params }),
    getFilters: () => api.get("/search/filters"),
    getTrending: () => api.get("/search/trending"),
  },

  // Agents
  agents: {
    getAll: (params) => api.get("/agents", { params }),
    getById: (id) => api.get(`/agents/${id}`),
    getVerified: () => api.get("/agents/verified"),
    getBySpecialization: (specialization) =>
      api.get(`/agents/specialization/${specialization}`),
    getStats: () => api.get("/agents/stats"),
    apply: (applicationData) => api.post("/agents/apply", applicationData),
    getApplications: (params) => api.get("/agents/applications", { params }),
    getApplicationById: (id) => api.get(`/agents/applications/${id}`),
    approveApplication: (id) => api.put(`/agents/applications/${id}/approve`),
    rejectApplication: (id, reason) =>
      api.put(`/agents/applications/${id}/reject`, { reason }),
  },

  // Chat
  chat: {
    getConversations: () => api.get("/chat"),
    getMessages: (chatId) => api.get(`/chat/${chatId}/messages`),
    sendMessage: (chatId, message) =>
      api.post(`/chat/${chatId}/messages`, message),
    createChat: (agentId, propertyId, message) =>
      api.post("/chat", { agentId, propertyId, message }),
  },

  // Payments
  payments: {
    createPayment: (paymentData) => api.post("/payments", paymentData),
    getPaymentHistory: () => api.get("/payments"),
    getPaymentById: (id) => api.get(`/payments/${id}`),
    refundPayment: (id, reason) =>
      api.post(`/payments/${id}/refund`, { reason }),
  },

  // Notifications
  notifications: {
    getAll: () => api.get("/notifications"),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put("/notifications/read-all"),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
  },

  // Upload
  upload: {
    uploadImage: (file, folder = "general") => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", folder);
      return api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    uploadImages: (files, folder = "properties") => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      return api.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    uploadDocument: (file, folder = "documents") => {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("folder", folder);
      return api.post("/upload/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },
};

// Export the axios instance for custom requests
export { api };

// Export default service
export default apiService;
