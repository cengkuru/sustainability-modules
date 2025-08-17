import * as nodemailer from 'nodemailer';
import * as functions from 'firebase-functions';

// Create transporter with Gmail SMTP
const createTransporter = () => {
  const smtpEmail = process.env.SMTP_EMAIL || functions.config().smtp?.email;
  const smtpPass = process.env.SMTP_PASS || functions.config().smtp?.pass;

  if (!smtpEmail || !smtpPass) {
    throw new Error('SMTP credentials not configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpEmail,
      pass: smtpPass
    }
  });
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  resetLink: string
): Promise<void> => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `MOZ Portal <${process.env.SMTP_EMAIL || functions.config().smtp?.email}>`,
    to: toEmail,
    subject: 'Password Reset Request - MOZ Portal',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #61a8bd;
              margin: 0;
              font-size: 24px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #61a8bd;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: 500;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #4a8399;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              border-radius: 4px;
              padding: 10px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MOZ Portal</h1>
              <p>Password Reset Request</p>
            </div>
            
            <div class="content">
              <p>Hello,</p>
              
              <p>We received a request to reset your password for your MOZ Portal account. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #61a8bd;">${resetLink}</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated email from MOZ Portal. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} MOZ Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - MOZ Portal
      
      Hello,
      
      We received a request to reset your password for your MOZ Portal account.
      
      To reset your password, please visit the following link:
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      
      This is an automated email from MOZ Portal. Please do not reply to this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendTestEmail = async (toEmail: string): Promise<void> => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `MOZ Portal Test <${process.env.SMTP_EMAIL || functions.config().smtp?.email}>`,
    to: toEmail,
    subject: 'Test Email from MOZ Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #61a8bd;">Test Email Successful!</h2>
        <p>This is a test email from MOZ Portal to verify SMTP configuration.</p>
        <p>Email sent at: ${new Date().toLocaleString()}</p>
        <p style="color: #666; font-size: 12px;">Sent via Gmail SMTP</p>
      </div>
    `,
    text: `Test Email from MOZ Portal\n\nThis is a test email to verify SMTP configuration.\n\nEmail sent at: ${new Date().toLocaleString()}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};