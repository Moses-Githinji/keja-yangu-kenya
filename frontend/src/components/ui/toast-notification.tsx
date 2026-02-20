import { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertCircle, XCircle, Loader, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ToastType = "success" | "error" | "warning" | "loading";

interface ToastNotificationProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const ToastNotification = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  onClose
}: ToastNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    const timer = setTimeout(() => onClose(id), 300);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  useEffect(() => {
    setIsVisible(true);
    
    if (type !== "loading" && duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, type, handleClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "loading":
        return <Loader className="h-5 w-5 text-primary animate-spin" />;
    }
  };

  const getBackgroundClass = () => {
    switch (type) {
      case "success":
        return "border-success/20 bg-success/5";
      case "error":
        return "border-destructive/20 bg-destructive/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "loading":
        return "border-primary/20 bg-primary/5";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 ${getBackgroundClass()} ${
        isVisible 
          ? "opacity-100 translate-x-0" 
          : "opacity-0 translate-x-full"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-card-foreground">
          {title}
        </h4>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>

      {type !== "loading" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ToastNotification;