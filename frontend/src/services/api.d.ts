export interface ApiService {
  auth: {
    signUp: (userData: any) => Promise<any>;
    signIn: (credentials: { email: string; password: string }) => Promise<any>;
    refreshToken: (refreshToken: string) => Promise<any>;
    logout: () => Promise<any>;
    forgotPassword: (email: string) => Promise<any>;
    resetPassword: (token: string, password: string) => Promise<any>;
    verifyEmail: (email: string, code: string) => Promise<any>;
    resendVerification: (email: string) => Promise<any>;
  };
  users: {
    getProfile: () => Promise<any>;
    updateProfile: (userData: any) => Promise<any>;
    deleteAccount: () => Promise<any>;
    getPreferences: () => Promise<any>;
    updatePreferences: (preferences: any) => Promise<any>;
    getSavedProperties: () => Promise<any>;
    saveProperty: (propertyId: string) => Promise<any>;
    removeSavedProperty: (propertyId: string) => Promise<any>;
    // Admin functions
    getAllUsers: (params?: any) => Promise<any>;
    getUserById: (id: string) => Promise<any>;
    updateUserStatus: (id: string, status: any) => Promise<any>;
    deleteUser: (id: string) => Promise<any>;
  };
  properties: {
    getAll: (params?: any) => Promise<any>;
    getById: (id: string) => Promise<any>;
    getFeatured: () => Promise<any>;
    create: (propertyData: any) => Promise<any>;
    update: (id: string, propertyData: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
    uploadImages: (id: string, images: File[]) => Promise<any>;
    deleteImage: (propertyId: string, imageId: string) => Promise<any>;
    getInquiries: (id: string) => Promise<any>;
    createInquiry: (id: string, inquiryData: any) => Promise<any>;
  };
  search: {
    searchProperties: (params?: any) => Promise<any>;
    getFilters: () => Promise<any>;
    getTrending: () => Promise<any>;
  };
  agents: {
    getAll: (params?: any) => Promise<any>;
    getById: (id: string) => Promise<any>;
    getVerified: () => Promise<any>;
    getBySpecialization: (specialization: string) => Promise<any>;
    getStats: () => Promise<any>;
    apply: (applicationData: any) => Promise<any>;
    getApplications: (params?: any) => Promise<any>;
    getApplicationById: (id: string) => Promise<any>;
    approveApplication: (id: string) => Promise<any>;
    rejectApplication: (id: string, reason?: string) => Promise<any>;
  };
  chat: {
    getConversations: () => Promise<any>;
    getMessages: (chatId: string) => Promise<any>;
    sendMessage: (chatId: string, message: any) => Promise<any>;
    createChat: (
      agentId: string,
      propertyId?: string,
      message: any
    ) => Promise<any>;
  };
  payments: {
    createPayment: (paymentData: any) => Promise<any>;
    getPaymentHistory: () => Promise<any>;
    getPaymentById: (id: string) => Promise<any>;
    refundPayment: (id: string, reason: string) => Promise<any>;
  };
  notifications: {
    getAll: () => Promise<any>;
    markAsRead: (id: string) => Promise<any>;
    markAllAsRead: () => Promise<any>;
    deleteNotification: (id: string) => Promise<any>;
  };
  upload: {
    uploadImage: (file: File, folder?: string) => Promise<any>;
    uploadImages: (files: File[], folder?: string) => Promise<any>;
    uploadDocument: (file: File, folder?: string) => Promise<any>;
  };
}

export const apiService: ApiService;
