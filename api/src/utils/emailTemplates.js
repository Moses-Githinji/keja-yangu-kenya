// Email templates for Keja Yangu Kenya

export const emailTemplates = {
  // Agent Application Success Template
  agentApplicationSuccess: (data) => `
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

  // Agent Application Approved Template
  agentApplicationApproved: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Application Approved - Keja Yangu Kenya</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .success { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
        .features { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations! You're Now an Agent!</h1>
            <p>Keja Yangu Kenya - Real Estate Platform</p>
        </div>

        <div class="content">
            <h2>Hello ${data.recipientName},</h2>

            <div class="success">
                <h3>✅ Great News!</h3>
                <p>Your agent application has been <strong>approved</strong>! Welcome to the Keja Yangu Kenya agent community.</p>
            </div>

            <p><strong>What happens next?</strong></p>
            <ol>
                <li>You now have access to the agent dashboard</li>
                <li>You can start listing properties immediately</li>
                <li>Set up your agent profile and preferences</li>
                <li>Begin managing your real estate business</li>
            </ol>

            <div class="features">
                <h3>🚀 Your Agent Features:</h3>
                <ul>
                    <li>✅ Unlimited property listings</li>
                    <li>✅ Advanced property management tools</li>
                    <li>✅ Direct communication with property seekers</li>
                    <li>✅ Commission tracking and earnings reports</li>
                    <li>✅ Marketing tools and analytics</li>
                    <li>✅ Professional support and training resources</li>
                    <li>✅ Priority customer support</li>
                </ul>
            </div>

            <p><strong>Getting Started:</strong></p>
            <ol>
                <li>Log in to your account</li>
                <li>Complete your agent profile setup</li>
                <li>Add your first property listing</li>
                <li>Explore the agent dashboard features</li>
            </ol>

            <p>If you need any assistance getting started or have questions about your agent account, please don't hesitate to contact our agent support team at <a href="mailto:agents@kejayangu.co.ke">agents@kejayangu.co.ke</a> or call us at +254 700 000 000.</p>

            <p>We're excited to have you as part of our growing network of professional real estate agents!</p>

            <p>Best regards,<br>
            <strong>The Keja Yangu Kenya Team</strong></p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://kejayangu.co.ke/agent-dashboard" class="button">Access Agent Dashboard</a>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 Keja Yangu Kenya. All rights reserved.</p>
            <p>This email was sent to ${data.recipientEmail}. If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`,

  // Agent Application Rejected Template
  agentApplicationRejected: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Application Update - Keja Yangu Kenya</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .info { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .next-steps { background-color: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Agent Application Update</h1>
            <p>Keja Yangu Kenya - Real Estate Platform</p>
        </div>

        <div class="content">
            <h2>Hello ${data.recipientName},</h2>

            <p>Thank you for your interest in becoming a real estate agent with <strong>Keja Yangu Kenya</strong>.</p>

            <div class="info">
                <h3>📋 Application Status: Not Approved</h3>
                <p>After careful review, we regret to inform you that your agent application has not been approved at this time.</p>
            </div>

            ${
              data.rejectionReason
                ? `
            <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h4>Reason for Decision:</h4>
                <p>${data.rejectionReason}</p>
            </div>
            `
                : ""
            }

            <div class="next-steps">
                <h3>🔄 What You Can Do Next:</h3>
                <ul>
                    <li><strong>Reapply:</strong> You can submit a new application after addressing any concerns mentioned above</li>
                    <li><strong>Improve Your Profile:</strong> Consider adding more experience details or qualifications</li>
                    <li><strong>Contact Support:</strong> Reach out to our team for guidance on improving your application</li>
                    <li><strong>Stay Updated:</strong> Follow our platform for future opportunities</li>
                </ul>
            </div>

            <p><strong>Why do we have application requirements?</strong></p>
            <p>To maintain the quality and professionalism of our agent network, we carefully review each application to ensure our agents can provide the best service to property seekers and owners.</p>

            <p>If you have questions about this decision or would like feedback on how to strengthen your application, please contact our support team at <a href="mailto:support@kejayangu.co.ke">support@kejayangu.co.ke</a> or call us at +254 700 000 000.</p>

            <p>We appreciate your interest in joining the Keja Yangu Kenya community and wish you the best in your real estate endeavors.</p>

            <p>Best regards,<br>
            <strong>The Keja Yangu Kenya Team</strong></p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://kejayangu.co.ke/become-agent" class="button">Reapply as Agent</a>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 Keja Yangu Kenya. All rights reserved.</p>
            <p>This email was sent to ${
              data.recipientEmail
            }. If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`,

  // Billing Invoice Template
  billingInvoice: (data) => `
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
export const getEmailTemplate = (templateName, data) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  return template(data);
};

// Email subjects
export const emailSubjects = {
  agentApplicationSuccess: "🎉 Agent Application Submitted - Keja Yangu Kenya",
  agentApplicationApproved:
    "🎉 Congratulations! Your Agent Application Has Been Approved - Keja Yangu Kenya",
  agentApplicationRejected: "Agent Application Update - Keja Yangu Kenya",
  billingInvoice: "📄 New Invoice Generated - Keja Yangu Kenya",
};
