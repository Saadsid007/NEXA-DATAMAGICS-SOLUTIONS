import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { email } = req.body;
    const user = await User.findOne({ email });

    // To prevent email enumeration attacks, always return a success-like message.
    // The email will only be sent if the user actually exists.
    if (user) {
      // 1. Generate a secure, random token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // 2. Hash the token before saving it to the database for security
      const passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // 3. Set an expiry for the token (e.g., 10 minutes)
      const passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Use a direct update command to ensure the data is saved.
      // This is more reliable than instance.save() if it's failing silently.
      await User.updateOne(
        { _id: user._id },
        {
          $set: { passwordResetToken, passwordResetExpires },
        }
      );

      // 4. Create the reset URL and send the email
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
      
      await sendPasswordResetEmail(user, resetUrl);
    }

    res.status(200).json({
      message: `If an account with that email exists, a password reset link has been sent to ${user.email}. Please check your inbox.`,
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    // Send a generic error to the client
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
}