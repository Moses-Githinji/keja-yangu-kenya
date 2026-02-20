import React, { useState, useEffect } from "react";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle, XCircle, CreditCard } from "lucide-react";

interface FlutterwavePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  propertyId?: string;
  propertyDetails?: any;
  onSuccess?: () => void;
}

const FlutterwavePaymentModal: React.FC<FlutterwavePaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  propertyId,
  propertyDetails,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string>("");

  // Create payment record on open
  useEffect(() => {
    if (isOpen && !paymentId) {
      createPaymentRecord();
    }
  }, [isOpen]);

  const createPaymentRecord = async () => {
    setIsLoading(true);
    try {
      const transactionId = `TXN_FLW_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      const response = await apiService.payments.createPayment({
        amount,
        currency: "KES",
        paymentMethod: "FLUTTERWAVE",
        description: propertyDetails
          ? `Payment for property ${propertyDetails.title}`
          : "Property payment",
      });

      setPaymentId(response.data.data.id);
      setTxRef(transactionId);
      setStatus("idle");
    } catch (error: any) {
      console.error("Payment record creation failed:", error);
      setStatus("error");
      setMessage("Failed to initialize payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY || "",
    tx_ref: txRef,
    amount,
    currency: "KES",
    payment_options: "card,mpesa,banktransfer",
    customer: {
      email: user?.email || "",
      phone_number: user?.phoneNumber || "",
      name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    },
    customizations: {
      title: "Keja Yangu Kenya",
      description: propertyDetails
        ? `Payment for ${propertyDetails.title}`
        : "Property payment",
      logo: "/favicon.ico",
    },
    redirect_url: window.location.origin + "/payment/success",
  };

  const handleFlutterPayment = useFlutterwave(config);

  const initiatePayment = () => {
    if (!txRef) {
      setMessage("Payment not initialized. Please try again.");
      return;
    }

    setStatus("processing");
    setMessage("Opening payment gateway...");
    handleFlutterPayment({
      callback: async (response) => {
        console.log("Flutterwave callback:", response);
        if (response.status === "successful") {
          // Verify payment on backend
          try {
            await apiService.payments.verifyFlutterwave({
              transaction_id: response.transaction_id,
              tx_ref: response.tx_ref,
            });
            setStatus("success");
            setMessage("Payment completed successfully!");
            setTimeout(() => {
              onClose();
              onSuccess?.();
              window.location.href = "/payment/success";
            }, 2000);
          } catch (error) {
            console.error("Verification failed:", error);
            setStatus("error");
            setMessage("Payment verification failed. Please contact support.");
          }
        } else {
          setStatus("error");
          setMessage("Payment was not successful. Please try again.");
        }
      },
      onClose: () => {
        if (status === "processing") {
          setStatus("idle");
          setMessage("");
        }
      },
    });
  };

  const resetModal = () => {
    setIsLoading(false);
    setStatus("idle");
    setMessage("");
    setPaymentId(null);
    setTxRef("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pay with Flutterwave
          </DialogTitle>
          <DialogDescription>
            Complete your payment securely using cards, M-Pesa, or bank transfer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Display */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-2xl font-bold">KES {amount.toLocaleString()}</p>
          </div>

          {/* Status Messages */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                status === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : status === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {status === "processing" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {status === "success" && <CheckCircle className="h-4 w-4" />}
                {status === "error" && <XCircle className="h-4 w-4" />}
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          {status === "processing" && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Instructions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Complete the payment in the popup window</li>
                <li>You can use card, M-Pesa, or bank transfer</li>
                <li>Wait for payment confirmation</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {status === "idle" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={initiatePayment}
                  disabled={isLoading || !txRef}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </>
            )}

            {(status === "success" || status === "error") && (
              <Button onClick={handleClose} className="w-full">
                {status === "success" ? "Continue" : "Close"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlutterwavePaymentModal;
