import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decode } from "next-auth/jwt";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        // **THE FIX: Handle the re-signin with the new token**
        if (credentials.token) {
          const decodedToken = await decode({ token: credentials.token, secret: process.env.NEXTAUTH_SECRET });
          return decodedToken; // Trust the decoded token and create a session from it
        }

        // Original login flow
        const { email, password } = credentials;

        try {
          await connectDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          // Return the user object to be used in callbacks
          return user;
        } catch (error) {
          console.log("Error in authorize: ", error);
          return null;
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
        }
        // Also apply any session data passed directly
        return { ...token, ...session };
      }

      // On initial sign-in, add user details to the token
      if (user) {
        token.id = user._id ? user._id.toString() : user.id; // Handles both DB user object and decoded token
        token.role = user.role;
        token.status = user.status;
        token.profileComplete = user.profileComplete;
        token.employeeCode = user.employeeCode;
        token.assignedManager = user.assignedManager;
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
      return session;
    },
  },
};

export default NextAuth(authOptions);
