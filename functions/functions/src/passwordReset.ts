import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { sendPasswordResetEmail, sendTestEmail } from './emailService';
import * as crypto from 'crypto';

// Store reset tokens temporarily (in production, use Firestore)
const resetTokens = new Map<string, { email: string; expiry: number }>();

export const sendPasswordReset = functions.https.onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      console.log('Processing password reset for:', email);

      // Check if user exists in Firebase Auth
      let user;
      try {
        user = await admin.auth().getUserByEmail(email);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          res.status(404).json({ error: 'EMAIL_NOT_FOUND', message: 'No user found with this email' });
          return;
        }
        throw error;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = Date.now() + 3600000; // 1 hour from now

      // Store token (in production, use Firestore)
      resetTokens.set(resetToken, { email, expiry });

      // Generate reset link
      const resetLink = `https://climatefinance-2dcc3.web.app/public/reset-password?token=${resetToken}`;

      // Send email using our custom email service
      await sendPasswordResetEmail(email, resetLink);

      console.log('Password reset email sent successfully to:', email);

      res.status(200).json({ 
        success: true, 
        message: 'Password reset email sent successfully',
        // Don't send this in production
        debug: process.env.NODE_ENV !== 'production' ? { resetLink } : undefined
      });

    } catch (error: any) {
      console.error('Error in sendPasswordReset:', error);
      res.status(500).json({ 
        error: 'INTERNAL_ERROR', 
        message: 'Failed to send password reset email',
        details: error.message 
      });
    }
  }
);

export const verifyResetToken = functions.https.onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
      }

      // Verify token
      const tokenData = resetTokens.get(token);
      if (!tokenData) {
        res.status(400).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired reset token' });
        return;
      }

      if (Date.now() > tokenData.expiry) {
        resetTokens.delete(token);
        res.status(400).json({ error: 'EXPIRED_TOKEN', message: 'Reset token has expired' });
        return;
      }

      // Update user password in Firebase Auth
      const user = await admin.auth().getUserByEmail(tokenData.email);
      await admin.auth().updateUser(user.uid, {
        password: newPassword
      });

      // Delete used token
      resetTokens.delete(token);

      res.status(200).json({ 
        success: true, 
        message: 'Password reset successfully' 
      });

    } catch (error: any) {
      console.error('Error in verifyResetToken:', error);
      res.status(500).json({ 
        error: 'INTERNAL_ERROR', 
        message: 'Failed to reset password',
        details: error.message 
      });
    }
  }
);

export const testEmail = functions.https.onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      console.log('Sending test email to:', email);

      // Send test email
      await sendTestEmail(email);

      res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully to ' + email
      });

    } catch (error: any) {
      console.error('Error sending test email:', error);
      res.status(500).json({ 
        error: 'INTERNAL_ERROR', 
        message: 'Failed to send test email',
        details: error.message 
      });
    }
  }
);