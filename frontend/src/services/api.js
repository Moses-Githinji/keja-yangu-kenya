import axios from "axios";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000, // 30 seconds default timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Create a separate axios instance for file uploads with longer timeout
const fileUploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 60000, // 60 seconds for file uploads
  withCredentials: true,
});

// Add request interceptor to file upload instance
fileUploadApi.interceptors.request.use(
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
      if (refreshToken && !error.config._isRetryRequest) {
        try {
          console.log("API: Attempting to refresh token...");
          const response = await api.post("/auth/refresh", {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Retry original request with new token
          error.config._isRetryRequest = true;
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          console.log("API: Token refresh failed, clearing auth state");
          // Refresh failed, clear auth state
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes("/auth/")) {
            window.location.href = "/auth/signin";
          }
        }
      } else {
        // No refresh token or already retried, clear auth state
        console.log("API: No refresh token available or max retries reached");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        if (!window.location.pathname.includes("/auth/")) {
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
    getFeatured: (params) => api.get("/properties", { params: { ...params, isPremium: true } }),
    getVerified: (params) => api.get("/properties", { params: { ...params, isVerified: true } }),
    create: (propertyData) => api.post("/properties", propertyData),
    update: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
    delete: (id) => api.delete(`/properties/${id}`),
    uploadImages: async (id, images) => {
      const formData = new FormData();
      
      // Ensure we have valid files
      if (!Array.isArray(images) || images.length === 0) {
        throw new Error('No valid images provided for upload');
      }
      
      // Append each file to formData
      images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append("images", image);
        } else if (image && image.file instanceof File) {
          // Handle case where image is an object with a file property
          formData.append("images", image.file);
        } else {
          console.warn('Skipping invalid image at index', index, image);
        }
      });
      
      // Check if we have any valid files to upload
      if (formData.getAll('images').length === 0) {
        throw new Error('No valid image files found to upload');
      }
      
      try {
        const response = await api.post(`/upload/property-images/${id}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        });
        return response;
      } catch (error) {
        console.error('Image upload error:', error);
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Failed to upload images';
        throw new Error(errorMessage);
      }
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
    initiateStkPush: (stkPushData) =>
      api.post("/payments/initiate-stk-push", stkPushData),
    verifyFlutterwave: (data) => api.post("/payments/verify-flutterwave", data),
    getPaymentHistory: () => api.get("/payments"),
    getPaymentById: (id) => api.get(`/payments/${id}`),
    refundPayment: (id, reason) =>
      api.post(`/payments/${id}/refund`, { reason }),
  },

  // Notifications
  notifications: {
    getAll: (params) => api.get("/notifications", { params }),
    getUnreadCount: () => api.get("/notifications/unread-count"),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put("/notifications/read-all"),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
    clearRead: () => api.delete("/notifications/clear-read"),
  },

  // Brief Stay
  briefStay: {
    getHostStats: () => api.get("/brief-stay/host/stats"),
  },

  // Admin
  admin: {
    getStats: () => api.get("/admin/stats"),
    getRecentActivity: () => api.get("/admin/recent-activity"),
  },

  // Health
  health: {
    getDetailed: () => api.get("/health/detailed"),
  },

  // Upload
  upload: {
    uploadImage: async (file, folder = "general") => {
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", folder);

        // Show upload progress
        const onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        };

        const response = await fileUploadApi.post("/upload/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          onUploadProgress,
          timeout: 300000, // 5 minutes timeout for image uploads
        });
        return response.data;
      } catch (error) {
        console.error("Image upload error:", error);
        if (error.code === 'ECONNABORTED') {
          throw new Error("Upload timed out. Please check your internet connection and try again.");
        }
        throw new Error(
          error.response?.data?.message ||
          error.message ||
          "Failed to upload image. Please try again."
        );
      }
    },
    uploadImages: async (files, propertyId) => {
      try {
        if (!propertyId) {
          throw new Error("Property ID is required for uploading multiple images");
        }

        const formData = new FormData();
        files.forEach((file) => {
          formData.append("images", file);
        });

        // Show upload progress
        const onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        };

        const response = await fileUploadApi.post(
          `/upload/property-images/${propertyId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
            onUploadProgress,
            timeout: 600000, // 10 minutes timeout for multiple images
            maxBodyLength: 50 * 1024 * 1024, // 50MB max body size
            maxContentLength: 50 * 1024 * 1024, // 50MB max content length
          }
        );
        return response.data;
      } catch (error) {
        console.error("Multiple images upload error:", error);
        if (error.code === 'ECONNABORTED') {
          throw new Error("Upload timed out. Please check your internet connection and try again.");
        }
        throw new Error(
          error.response?.data?.message ||
          error.message ||
          "Failed to upload images. Please try again."
        );
      }
    },
    uploadDocument: async (file, folder = "documents") => {
      try {
        const formData = new FormData();
        formData.append("document", file);
        formData.append("folder", folder);

        const response = await fileUploadApi.post("/upload/document", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: 300000, // 5 minutes timeout for document uploads
        });
        return response.data;
      } catch (error) {
        console.error("Document upload error:", error);
        if (error.code === 'ECONNABORTED') {
          throw new Error("Upload timed out. Please check your internet connection and try again.");
        }
        throw new Error(
          error.response?.data?.message ||
          error.message ||
          "Failed to upload document. Please try again."
        );
      }
    },
  },
};

// Export the axios instance for custom requests
export { api };

// Export default service
export default apiService;
