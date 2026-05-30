import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import User from "@/app/db/models/User";
import dbConnect from "@/app/db/mongoConnection";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ account }) {
      const allowedProviders = ["google", "github", "facebook"];
      if (account && allowedProviders.includes(account.provider)) {
        return true;
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update") {
        if (session?.user) {
          token.name = session.user.name ?? token.name;
          token.bio = session.user.bio ?? token.bio;
          token.phone = session.user.phone ?? token.phone;
          token.timezone = session.user.timezone ?? token.timezone;
          token.email = session.user.email ?? token.email;
          token.image = session.user.image ?? token.image;
        }

        return token;
      }

      if (account && user) {
        try {
          await dbConnect();
          const userEmail =
            user.email ||
            `${account.providerAccountId}@${account.provider}.auth`;

          const dbUser = await User.findOneAndUpdate(
            { email: userEmail },
            {
              $setOnInsert: {
                name: user.name,
                email: userEmail,
                image: user.image,
                role: "user",
                bio: "",
                phone: "",
                timezone: "",
              },
            },
            { returnDocument: "after", upsert: true },
          ).lean();

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.email = userEmail;
            token.name = dbUser.name;
            token.bio = dbUser.bio || "";
            token.phone = dbUser.phone || "";
            token.timezone = dbUser.timezone || "";
            token.image = dbUser.image;
          }
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email || session.user.email;
        session.user.name = token.name as string;
        session.user.bio = token.bio as string;
        session.user.phone = token.phone as string;
        session.user.timezone = token.timezone as string;
        session.user.image = token.image as string;
      }

      return session;
    },
  },
});
