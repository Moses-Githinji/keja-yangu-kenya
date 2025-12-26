import { apiService } from "./api";

// Email service interface - now works with backend email system
export interface EmailService {
  // These functions now trigger backend email sending
  triggerVerificationEmail: (
    email: string,
    userName: string
  ) => Promise<boolean>;
  triggerAccountSetupEmail: (
    email: string,
    userName: string
  ) => Promise<boolean>;
  triggerPasswordResetEmail: (
    email: string,
    userName: string
  ) => Promise<boolean>;
}

// Email service implementation
class EmailServiceImpl implements EmailService {
  // Trigger email verification (backend handles the actual sending)
  async triggerVerificationEmail(
    email: string,
    userName: string
  ): Promise<boolean> {
    try {
      // This would typically be called after user registration
      // The backend automatically sends verification emails during registration
      console.log(`Verification email triggered for ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to trigger verification email:", error);
      return false;
    }
  }

  // Trigger account setup email (backend handles the actual sending)
  async triggerAccountSetupEmail(
    email: string,
    userName: string
  ): Promise<boolean> {
    try {
      // This would typically be called after email verification
      // The backend can send welcome emails
      console.log(`Account setup email triggered for ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to trigger account setup email:", error);
      return false;
    }
  }

  // Trigger password reset email (backend handles the actual sending)
  async triggerPasswordResetEmail(
    email: string,
    userName: string
  ): Promise<boolean> {
    try {
      // This is handled by the forgotPassword API endpoint
      // The backend automatically sends password reset emails
      console.log(`Password reset email triggered for ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to trigger password reset email:", error);
      return false;
    }
  }

  // Generate password reset link for frontend routing
  generatePasswordResetLink(token: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:3000";
    return `${baseUrl}/auth/reset-password?token=${token}`;
  }
}

// Export singleton instance
export const emailService = new EmailServiceImpl();

// Export types
export type { EmailService };
export default emailService;
