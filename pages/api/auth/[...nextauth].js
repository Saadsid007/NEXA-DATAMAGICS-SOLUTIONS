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
        console.log("Authorize called with:", email); // Debug log

        try {
          await connectDB();
          const user = await User.findOne({ email }).lean(); // Use .lean() for a plain JS object
          console.log("User found:", user); // Debug log

          if (!user) {
            console.log("No user found for email:", email);
            throw new Error("Invalid credentials. Please try again.");
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log("Password match result:", passwordsMatch); // Debug log

          if (!passwordsMatch) {
            console.log("Password mismatch for user:", email);
            throw new Error("Invalid credentials. Please try again.");
          }

          // Return only the required fields as a plain object
          // **THE MAJOR CHANGE**: We only return the user object.
          // The JWT callback will handle extracting the data.
          // This ensures the entire user object is available to the JWT callback.
          return user;
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
        // The 'user' object is the full user object from the 'authorize' callback
        token.id = user._id.toString();
        token.role = user.role;
        token.status = user.status;
        token.profileComplete = user.profileComplete;
        token.employeeCode = user.employeeCode || null; // Set to null if not present
        token.assignedManager = user.managerAssign || null; // Corrected field name from User model
        token.name = user.name;
        token.email = user.email;
        token.profileImage = user.profileImage || null;
      }

      // This is the key part for keeping the session updated.
      // When the session is updated (e.g., after profile setup), re-fetch user data.
      if (trigger === "update") {
        console.log("JWT update triggered. New session data:", session);
        await connectDB();
        const updatedUser = await User.findById(token.id).lean();
        if (updatedUser) {
          token.role = updatedUser.role;
          token.status = updatedUser.status;
          token.profileComplete = updatedUser.profileComplete;
          token.employeeCode = updatedUser.employeeCode;
          token.assignedManager = updatedUser.managerAssign || null; // Corrected field name
          token.name = updatedUser.name;
          token.email = updatedUser.email;
          token.profileImage = updatedUser.profileImage;
        }
        // Also apply any session data passed directly
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) session.user = {};
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.status = token.status;
      session.user.profileComplete = token.profileComplete;
      session.user.employeeCode = token.employeeCode;
      session.user.assignedManager = token.assignedManager;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.profileImage = token.profileImage;
      return session;
    },
  },
};

export default NextAuth(authOptions);
