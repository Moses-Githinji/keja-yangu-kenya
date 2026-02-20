import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import MpesaPaymentModal from "../MpesaPaymentModal";
import { apiService } from "@/services/api";

// Mock the API service
vi.mock("@/services/api", () => ({
  apiService: {
    payments: {
      initiateStkPush: vi.fn(),
      getPaymentById: vi.fn(),
    },
  },
}));

// Mock the auth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "test-user-id",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    },
  }),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className} />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-circle" className={className} />
  ),
  XCircle: ({ className }: { className?: string }) => (
    <div data-testid="x-circle" className={className} />
  ),
  Smartphone: ({ className }: { className?: string }) => (
    <div data-testid="smartphone" className={className} />
  ),
}));

// Mock shadcn components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, placeholder, maxLength, className, id }: any) => (
    <input
      id={id}
      data-testid="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={className}
    />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => (
    <label data-testid="label" htmlFor={htmlFor}>
      {children}
    </label>
  ),
}));

describe("MpesaPaymentModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    amount: 50000,
    propertyId: "test-property-id",
    propertyDetails: { title: "Test Property" },
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { href: "", reload: vi.fn() },
      writable: true,
    });
  });

  it("renders modal with correct amount display", () => {
    render(<MpesaPaymentModal {...defaultProps} />);

    expect(screen.getByText("Pay with M-Pesa")).toBeInTheDocument();
    expect(screen.getByText("Amount to Pay")).toBeInTheDocument();
    expect(screen.getByText("KES 50,000")).toBeInTheDocument();
  });

  it("validates phone number format", async () => {
    const user = userEvent.setup();
    render(<MpesaPaymentModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("0712 345 678");
    const payButton = screen.getAllByTestId("button")[1]; // Pay button

    // Invalid phone number
    await user.type(phoneInput, "12345");
    expect(payButton).toBeDisabled();

    // Valid phone number
    await user.clear(phoneInput);
    await user.type(phoneInput, "0712345678");
    expect(payButton).not.toBeDisabled();
  });

  it("formats phone number correctly", async () => {
    const user = userEvent.setup();
    render(<MpesaPaymentModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("0712 345 678");

    await user.type(phoneInput, "0712345678");
    expect(phoneInput).toHaveValue("0712 345 678");
  });

  it("initiates payment successfully", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        data: {
          paymentId: "test-payment-id",
          checkoutRequestId: "ws_CO_123456789",
          customerMessage: "Success. Request accepted for processing",
        },
      },
    };

    apiService.payments.initiateStkPush.mockResolvedValue(mockResponse);

    render(<MpesaPaymentModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("0712 345 678");
    const payButton = screen.getAllByTestId("button")[1];

    await user.type(phoneInput, "0712345678");
    await user.click(payButton);

    await waitFor(() => {
      expect(apiService.payments.initiateStkPush).toHaveBeenCalledWith({
        amount: 50000,
        phoneNumber: "0712345678",
        propertyId: "test-property-id",
        propertyDetails: { title: "Test Property" },
      });
    });

    // Check that processing state is shown
    expect(
      screen.getByText(
        "STK Push initiated! Check your phone for the M-Pesa prompt."
      )
    ).toBeInTheDocument();
  });

  it("handles payment initiation error", async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: {
          message: "Payment initiation failed",
        },
      },
    };

    apiService.payments.initiateStkPush.mockRejectedValue(mockError);

    render(<MpesaPaymentModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("0712 345 678");
    const payButton = screen.getAllByTestId("button")[1];

    await user.type(phoneInput, "0712345678");
    await user.click(payButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to initiate payment. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("polls payment status and handles success", async () => {
    const user = userEvent.setup();

    // Mock successful initiation
    const mockInitiateResponse = {
      data: {
        data: {
          paymentId: "test-payment-id",
          checkoutRequestId: "ws_CO_123456789",
          customerMessage: "Success. Request accepted for processing",
        },
      },
    };

    // Mock successful payment status
    const mockPaymentStatus = {
      data: {
        data: {
          status: "COMPLETED",
        },
      },
    };

    apiService.payments.initiateStkPush.mockResolvedValue(mockInitiateResponse);
    apiService.payments.getPaymentById.mockResolvedValue(mockPaymentStatus);

    render(<MpesaPaymentModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("0712 345 678");
    const payButton = screen.getAllByTestId("button")[1];

    await user.type(phoneInput, "0712345678");
    await user.click(payButton);

    // Wait for polling to complete
    await waitFor(
      () => {
        expect(
          screen.getByText("Payment completed successfully!")
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(window.location.href).toBe("/payment/success");
  });

  it("handles payment failure during polling", async () => {
    const user = userEvent.setup();

    // Mock successful initiation
    const mockInitiateResponse = {
      data: {
        data: {
          paymentId: "test-payment-id",
          checkoutRequestId: "ws_CO_123456789",
          customerMessage: "Success. Request accepted for processing",
        },
      },
    };

    // Mock failed payment status
    const mockPaymentStatus = {
      data: {
        data: {
          status: "FAILED",
        },
      },
    };

    apiService.payments.initiateStkPush.mockResolvedValue(mockInitiateResponse);
    apiService.payments.getPaymentById.mockResolvedValue(mockPaymentStatus);

    render(<MpesaPaymentModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("0712 345 678");
    const payButton = screen.getAllByTestId("button")[1];

    await user.type(phoneInput, "0712345678");
    await user.click(payButton);

    await waitFor(
      () => {
        expect(
          screen.getByText("Payment failed. Please try again.")
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it("handles timeout during polling", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers();

    // Mock successful initiation
    const mockInitiateResponse = {
      data: {
        data: {
          paymentId: "test-payment-id",
          checkoutRequestId: "ws_CO_123456789",
          customerMessage: "Success. Request accepted for processing",
        },
      },
    };

    // Mock pending payment status
    const mockPaymentStatus = {
      data: {
        data: {
          status: "PENDING",
        },
      },
    };

    apiService.payments.initiateStkPush.mockResolvedValue(mockInitiateResponse);
    apiService.payments.getPaymentById.mockResolvedValue(mockPaymentStatus);

    render(<MpesaPaymentModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("0712 345 678");
    const payButton = screen.getAllByTestId("button")[1];

    await user.type(phoneInput, "0712345678");
    await user.click(payButton);

    // Fast-forward time to trigger timeout
    vi.advanceTimersByTime(300000); // 5 minutes

    await waitFor(() => {
      expect(
        screen.getByText(
          "Payment timeout. Please check your M-Pesa messages and try again if needed."
        )
      ).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it("closes modal and resets state", async () => {
    const user = userEvent.setup();
    render(<MpesaPaymentModal {...defaultProps} />);

    const cancelButton = screen.getAllByTestId("button")[0]; // Cancel button

    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows instructions during processing", async () => {
    const user = userEvent.setup();

    const mockInitiateResponse = {
      data: {
        data: {
          paymentId: "test-payment-id",
          checkoutRequestId: "ws_CO_123456789",
          customerMessage: "Success. Request accepted for processing",
        },
      },
    };

    // Mock the API service methods
    vi.mocked(apiService.payments.initiateStkPush).mockResolvedValue(
      mockInitiateResponse as any
    );
    vi.mocked(apiService.payments.getPaymentById).mockResolvedValue({
      data: { data: { status: "PENDING" } },
    } as any);

    render(<MpesaPaymentModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("0712 345 678");
    const payButton = screen.getAllByTestId("button")[1];

    await user.type(phoneInput, "0712345678");
    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByText("Instructions:")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Check your phone for the M-Pesa STK Push notification"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("Enter your M-Pesa PIN to authorize the payment")
      ).toBeInTheDocument();
    });
  });

  it("does not render when closed", () => {
    render(<MpesaPaymentModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Pay with M-Pesa")).not.toBeInTheDocument();
  });
});
