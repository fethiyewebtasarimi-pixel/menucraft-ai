import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

// JWT type extension handled via callbacks below

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [];

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma) as import("next-auth/adapters").Adapter,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    ...providers,
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validatedFields = loginSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              passwordHash: true,
              role: true,
              avatar: true,
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { subscription: true },
          });

          // Create trial subscription for new OAuth users
          if (existingUser && !existingUser.subscription) {
            const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await prisma.subscription.create({
              data: {
                userId: existingUser.id,
                plan: "FREE",
                status: "TRIALING",
                trialPlan: "PROFESSIONAL",
                trialEndsAt: trialEnd,
                currentPeriodStart: new Date(),
                currentPeriodEnd: trialEnd,
                aiCredits: 200,
                aiCreditsUsed: 0,
              },
            });
          }
        } catch (error) {
          console.error("Error creating subscription:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Create trial subscription for new users
      try {
        const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.subscription.create({
          data: {
            userId: user.id!,
            plan: "FREE",
            status: "TRIALING",
            trialPlan: "PROFESSIONAL",
            trialEndsAt: trialEnd,
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEnd,
            aiCredits: 200,
            aiCreditsUsed: 0,
          },
        });
      } catch (error) {
        console.error("Error creating subscription on user creation:", error);
      }
    },
  },
});

export const { handlers, auth, signIn, signOut } = nextAuth;

// Alias for API routes compatibility
export const getServerSession = auth;
