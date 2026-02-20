import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle, XCircle, Smartphone } from "lucide-react";

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  propertyId?: string;
  propertyDetails?: any;
  onSuccess?: () => void;
}

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  propertyId,
  propertyDetails,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Phone number validation for Kenyan format
  const validatePhoneNumber = (phone: string) => {
    // Remove spaces and hyphens
    const cleanPhone = phone.replace(/[\s\-]/g, "");

    // Check if it starts with 07 or 01 and has 10 digits total
    const kenyanRegex = /^(07|01)\d{8}$/;
    return kenyanRegex.test(cleanPhone);
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");
    // Format as 07XX XXX XXX
    if (digits.length >= 3) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(
        7,
        10
      )}`.trim();
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits, spaces, and hyphens
    const cleanValue = value.replace(/[^\d\s\-]/g, "");
    setPhoneNumber(cleanValue);
  };

  const initiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setMessage(
        "Please enter a valid Kenyan phone number (07XX XXX XXX or 01XX XXX XXX)"
      );
      return;
    }

    setIsLoading(true);
    setStatus("processing");
    setMessage("Initiating M-Pesa payment...");

    try {
      const response = await apiService.payments.initiateStkPush({
        amount,
        phoneNumber: phoneNumber.replace(/[\s\-]/g, ""), // Clean phone number
        propertyId,
        propertyDetails,
      });

      setPaymentId(response.data.data.paymentId);
      setMessage("STK Push initiated! Check your phone for the M-Pesa prompt.");
      setStatus("processing"); // Still processing until callback

      // Start polling for payment status
      pollPaymentStatus(response.data.data.paymentId);
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Failed to initiate payment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiService.payments.getPaymentById(id);
        const payment = response.data.data;

        if (payment.status === "COMPLETED") {
          setStatus("success");
          setMessage("Payment completed successfully!");
          clearInterval(pollInterval);
          setTimeout(() => {
            onClose();
            onSuccess?.();
            // Redirect to success page
            window.location.href = "/payment/success";
          }, 2000);
        } else if (payment.status === "FAILED") {
          setStatus("error");
          setMessage("Payment failed. Please try again.");
          clearInterval(pollInterval);
        }
        // Continue polling if still PENDING or PROCESSING
      } catch (error) {
        console.error("Error polling payment status:", error);
        // Continue polling on error
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (status === "processing") {
        setStatus("error");
        setMessage(
          "Payment timeout. Please check your M-Pesa messages and try again if needed."
        );
      }
    }, 300000); // 5 minutes
  };

  const resetModal = () => {
    setPhoneNumber("");
    setIsLoading(false);
    setStatus("idle");
    setMessage("");
    setPaymentId(null);
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
            <Smartphone className="h-5 w-5" />
            Pay with M-Pesa
          </DialogTitle>
          <DialogDescription>
            Complete your payment securely using M-Pesa STK Push
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Display */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-2xl font-bold">KES {amount.toLocaleString()}</p>
          </div>

          {/* Phone Number Input */}
          {status === "idle" && (
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712 345 678"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={12}
                className={
                  !validatePhoneNumber(phoneNumber) && phoneNumber
                    ? "border-red-500"
                    : ""
                }
              />
              <p className="text-xs text-muted-foreground">
                Enter your M-Pesa registered phone number (07XX XXX XXX or 01XX
                XXX XXX)
              </p>
            </div>
          )}

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
                <li>Check your phone for the M-Pesa STK Push notification</li>
                <li>Enter your M-Pesa PIN to authorize the payment</li>
                <li>Wait for the payment confirmation</li>
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
                  disabled={isLoading || !validatePhoneNumber(phoneNumber)}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initiating...
                    </>
                  ) : (
                    "Pay with M-Pesa"
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

export default MpesaPaymentModal;
