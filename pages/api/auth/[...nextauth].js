import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectDB();
          const user = await User.findOne({ email });

          if (!user) {
            console.log("No user found for email:", email);
            throw new Error("Invalid credentials. Please try again.");
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            console.log("Password mismatch for user:", email);
            throw new Error("Invalid credentials. Please try again.");
          }

          // Return only the required fields as a plain object
          return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            profileComplete: user.profileComplete,
            employeeCode: user.employeeCode || null,
            assignedManager: user.assignedManager || null
          };
        } catch (error) {
          console.log("Error in authorize: ", error);
          throw new Error(error.message || "Authentication failed.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, add user details to the token
      if (user) {
        token.id = user._id ? user._id.toString() : user.id; // Handles both DB user object and decoded token
        token.role = user.role;
        token.status = user.status;
        token.profileComplete = user.profileComplete;
        token.employeeCode = user.employeeCode || null; // Set to null if not present
        token.assignedManager = user.assignedManager || null; // Set to null if not present
        token.name = user.name;
        token.email = user.email;
      }

      // This is the key part for keeping the session updated.
      // When the session is updated (e.g., after profile setup), re-fetch user data.
      if (trigger === "update") {
        await connectDB();
        const updatedUser = await User.findById(token.id);
        if (updatedUser) {
          token.role = updatedUser.role;
          token.status = updatedUser.status;
          token.profileComplete = updatedUser.profileComplete;
          token.employeeCode = updatedUser.employeeCode;
          token.assignedManager = updatedUser.assignedManager;
          token.name = updatedUser.name; // <-- FIX: add this
          token.email = updatedUser.email; // <-- FIX: add this
        }
        // Also apply any session data passed directly
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      // Pass token details to the client-side session object
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.status = token.status;
      session.user.profileComplete = token.profileComplete;
      session.user.employeeCode = token.employeeCode;
      session.user.assignedManager = token.assignedManager;
      session.user.name = token.name; // <-- Add this line
      session.user.email = token.email; // <-- Add this line (optional, for fallback)
      return session;
    },
  },
};

export default NextAuth(authOptions);
