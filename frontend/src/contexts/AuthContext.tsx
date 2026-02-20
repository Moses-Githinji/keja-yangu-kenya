import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { apiService } from "../services/api";

// Types
interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  profilePicture?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signUp: (
    userData: any
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  signIn: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  resetPassword: (
    token: string,
    password: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  verifyEmail: (
    email: string,
    code: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  resendVerification: (
    email: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateProfile: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  SET_ERROR: "SET_ERROR",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
} as const;

type AuthAction =
  | { type: typeof AUTH_ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof AUTH_ACTIONS.SET_USER; payload: User | null }
  | { type: typeof AUTH_ACTIONS.SET_ERROR; payload: string | null }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.CLEAR_ERROR };

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          console.log("AuthContext: Checking auth status with token...");
          const response = await apiService.users.getProfile();
          console.log("AuthContext: User profile loaded", {
            userId: response.data.data.id,
            role: response.data.data.role,
            email: response.data.data.email,
          });
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: response.data.data,
          });
        } catch (error: any) {
          console.error("AuthContext: Profile fetch failed", {
            error: error.response?.data || error.message,
            status: error.response?.status,
            token: token ? "present" : "missing",
          });

          // Token is invalid, clear it
          clearAuthState();

          // If it's a 404 "User not found" error, it means the user was deleted
          if (error.response?.status === 404) {
            dispatch({
              type: AUTH_ACTIONS.SET_ERROR,
              payload: "User account not found. Please contact support.",
            });
          } else if (error.response?.status === 401) {
            dispatch({
              type: AUTH_ACTIONS.SET_ERROR,
              payload: "Session expired. Please log in again.",
            });
          } else {
            dispatch({
              type: AUTH_ACTIONS.SET_ERROR,
              payload: "Authentication failed. Please log in again.",
            });
          }

          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        console.log("AuthContext: No token found");
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Sign up function
  const signUp = async (userData: any) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await apiService.auth.signUp(userData);
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Sign in function
  const signIn = async (credentials: { email: string; password: string }) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await apiService.auth.signIn(credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      // Log the user data to debug
      console.log("Login response user data:", user);

      // Ensure the user object has a role and it's uppercase for consistency
      const userWithRole = {
        ...user,
        role: (user.role || "USER").toUpperCase(), // Default to 'USER' if role is not provided
      };

      console.log("User role after normalization:", userWithRole.role);

      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Dispatch the user with the role
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userWithRole });
      return { 
        success: true, 
        data: {
          ...response.data,
          user: userWithRole // Make sure we return the user with normalized role
        } 
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Clear authentication state (used for invalid tokens)
  const clearAuthState = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      // Remove tokens regardless of API call success
      clearAuthState();
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await apiService.auth.forgotPassword(email);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Password reset request failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await apiService.auth.resetPassword(token, password);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Password reset failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Verify email function
  const verifyEmail = async (email: string, code: string) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await apiService.auth.verifyEmail(email, code);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Email verification failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Resend verification code function
  const resendVerification = async (email: string) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await apiService.auth.resendVerification(email);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to resend verification code";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile
  const updateProfile = async (userData: Partial<User>) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await apiService.users.updateProfile(userData);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.data });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Profile update failed";
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
