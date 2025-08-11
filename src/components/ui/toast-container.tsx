import { createContext, useContext, useState, ReactNode } from "react";
import ToastNotification, { ToastType } from "./toast-notification";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showLoading: (title: string, description?: string) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const showSuccess = (title: string, description?: string) => {
    showToast({ type: "success", title, description });
  };

  const showError = (title: string, description?: string) => {
    showToast({ type: "error", title, description });
  };

  const showWarning = (title: string, description?: string) => {
    showToast({ type: "warning", title, description });
  };

  const showLoading = (title: string, description?: string) => {
    return showToast({ type: "loading", title, description, duration: 0 });
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showError,
      showWarning,
      showLoading,
      hideToast
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={hideToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;