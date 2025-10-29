import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetConfirmationEmail } from '@/lib/email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { token, password } = req.body;

    // 1. Hash the token from the URL to match the one in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find the user by the hashed token and check if it's not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if expiry is in the future
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // 3. Check if the new password is the same as the old one
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) {
      return res.status(400).json({ message: 'Your new password cannot be your existing password.' });
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Update user's password and clear the reset token fields
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 5. Send a confirmation email
    await sendPasswordResetConfirmationEmail(user);

    res.status(200).json({ message: 'Your password has been successfully reset. You can now log in.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
}