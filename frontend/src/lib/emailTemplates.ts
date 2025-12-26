// Email templates for Keja Yangu Kenya

export interface EmailTemplateData {
  recipientName: string;
  recipientEmail: string;
  applicationId?: string;
  invoiceId?: string;
  amount?: string;
  dueDate?: string;
  propertyTitle?: string;
  agentName?: string;
  companyName?: string;
}

export const emailTemplates = {
  // Agent Application Success Template
  agentApplicationSuccess: (data: EmailTemplateData) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Application Submitted - Keja Yangu Kenya</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Application Submitted Successfully!</h1>
            <p>Keja Yangu Kenya - Real Estate Platform</p>
        </div>

        <div class="content">
            <h2>Hello ${data.recipientName},</h2>

            <p>Thank you for your interest in becoming a real estate agent with <strong>Keja Yangu Kenya</strong>!</p>

            <div class="highlight">
                <h3>📋 Application Details:</h3>
                <ul>
                    <li><strong>Application ID:</strong> ${
                      data.applicationId || "APP-" + Date.now()
                    }</li>
                    <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</li>
                    <li><strong>Status:</strong> Under Review</li>
                </ul>
            </div>

            <p><strong>What happens next?</strong></p>
            <ol>
                <li>Our team will review your application within 2-3 business days</li>
                <li>You'll receive an email notification once a decision is made</li>
                <li>If approved, you'll get access to the agent dashboard and listing tools</li>
                <li>You can start listing properties and managing your real estate business</li>
            </ol>

            <p><strong>Why become an agent with us?</strong></p>
            <ul>
                <li>✅ Access to thousands of property seekers</li>
                <li>✅ Advanced listing and management tools</li>
                <li>✅ Commission tracking and earnings reports</li>
                <li>✅ Professional support and training</li>
                <li>✅ Marketing tools to promote your listings</li>
            </ul>

            <p>If you have any questions about your application, please don't hesitate to contact our support team at <a href="mailto:support@kejayangu.co.ke">support@kejayangu.co.ke</a> or call us at +254 700 000 000.</p>

            <p>We look forward to potentially working with you!</p>

            <p>Best regards,<br>
            <strong>The Keja Yangu Kenya Team</strong></p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://kejayangu.co.ke/agent-dashboard" class="button">Visit Agent Portal</a>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 Keja Yangu Kenya. All rights reserved.</p>
            <p>This email was sent to ${
              data.recipientEmail
            }. If you didn't apply to become an agent, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`,

  // Billing Invoice Template
  billingInvoice: (data: EmailTemplateData) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Keja Yangu Kenya</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .invoice-table th { background-color: #f8f9fa; font-weight: bold; }
        .total-row { background-color: #f0f8ff; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .urgent { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 Invoice Generated</h1>
            <p>Keja Yangu Kenya - Real Estate Platform</p>
        </div>

        <div class="content">
            <h2>Hello ${data.recipientName},</h2>

            <p>A new invoice has been generated for your account with <strong>Keja Yangu Kenya</strong>.</p>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3>📋 Invoice Details:</h3>
                <table class="invoice-table">
                    <tr>
                        <th>Invoice ID:</th>
                        <td>${data.invoiceId || "INV-" + Date.now()}</td>
                    </tr>
                    <tr>
                        <th>Issue Date:</th>
                        <td>${new Date().toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <th>Due Date:</th>
                        <td>${
                          data.dueDate ||
                          new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()
                        }</td>
                    </tr>
                    <tr>
                        <th>Amount:</th>
                        <td><strong>KES ${data.amount || "0.00"}</strong></td>
                    </tr>
                    ${
                      data.propertyTitle
                        ? `
                    <tr>
                        <th>Property:</th>
                        <td>${data.propertyTitle}</td>
                    </tr>
                    `
                        : ""
                    }
                    ${
                      data.agentName
                        ? `
                    <tr>
                        <th>Agent:</th>
                        <td>${data.agentName}</td>
                    </tr>
                    `
                        : ""
                    }
                </table>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${
                          data.propertyTitle || "Property Listing Service"
                        }</td>
                        <td>1</td>
                        <td>KES ${data.amount || "0.00"}</td>
                        <td>KES ${data.amount || "0.00"}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="3"><strong>Total Amount Due:</strong></td>
                        <td><strong>KES ${data.amount || "0.00"}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div class="urgent">
                <h4>💰 Payment Information:</h4>
                <ul>
                    <li><strong>Due Date:</strong> ${
                      data.dueDate || "30 days from invoice date"
                    }</li>
                    <li><strong>Payment Methods:</strong> M-Pesa, Bank Transfer, Card</li>
                    <li><strong>Late Payment Fee:</strong> 2% per month on overdue amounts</li>
                </ul>
            </div>

            <p><strong>How to Pay:</strong></p>
            <ol>
                <li>Log in to your Keja Yangu Kenya account</li>
                <li>Go to Billing & Payments section</li>
                <li>Select the invoice and choose your payment method</li>
                <li>Complete the payment process</li>
            </ol>

            <p>If you have any questions about this invoice or need assistance with payment, please contact our billing team at <a href="mailto:billing@kejayangu.co.ke">billing@kejayangu.co.ke</a> or call +254 700 000 000.</p>

            <p>Thank you for choosing Keja Yangu Kenya!</p>

            <p>Best regards,<br>
            <strong>The Keja Yangu Kenya Billing Team</strong></p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://kejayangu.co.ke/billing" class="button">View Invoice & Pay Now</a>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 Keja Yangu Kenya. All rights reserved.</p>
            <p>This is an automated invoice notification. Please do not reply to this email.</p>
            <p>Email: ${data.recipientEmail}</p>
        </div>
    </div>
</body>
</html>`,
};

// Helper function to get email template
export const getEmailTemplate = (
  templateName: keyof typeof emailTemplates,
  data: EmailTemplateData
): string => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  return template(data);
};

// Email subjects
export const emailSubjects = {
  agentApplicationSuccess: "🎉 Agent Application Submitted - Keja Yangu Kenya",
  billingInvoice: "📄 New Invoice Generated - Keja Yangu Kenya",
} as const;
