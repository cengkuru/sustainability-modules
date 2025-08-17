import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Password reset endpoint (placeholder for now)
export const resetPassword = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    // Send password reset email via Firebase Auth
    // This would typically be done client-side, but can be done server-side too
    await admin.auth().generatePasswordResetLink(email);
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset email sent' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send password reset email' 
    });
  }
});