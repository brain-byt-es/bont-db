import NextAuth from "next-auth/next"
import { AuthOptions, DefaultSession } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      entraUserId?: string
      provider?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    entraUserId?: string
    displayName?: string
    provider?: string
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: { email: credentials.email.toLowerCase().trim() }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          return null
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email address before logging in.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.profilePhotoUrl
        }
      }
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      issuer: "https://www.linkedin.com/oauth",
      authorization: {
        params: { scope: "openid profile email" },
      },
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      profile(profile) {
        const defaultImage =
          "https://cdn-icons-png.flaticon.com/512/174/174857.png"
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture || defaultImage,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account }) {
      // 1. Initial Mapping (Standard)
      if (profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profile as any
        token.entraUserId = p.oid || p.sub
        token.email = p.email || p.preferred_username
        token.displayName = p.name
      }
      if (account) {
        token.provider = account.provider
      }

      // 2. Database Account Linking (Feature Flagged)
      if (process.env.ENABLE_DB_AUTH_LINKING === 'true' && account && profile) {
        try {
          const provider = account.provider
          let authProvider: 'azure_ad' | 'google' | 'linkedin' | null = null

          if (provider === 'azure-ad') authProvider = 'azure_ad'
          else if (provider === 'google') authProvider = 'google'
          else if (provider === 'linkedin') authProvider = 'linkedin'

          if (authProvider) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = profile as any
            const providerSubject = (authProvider === 'azure_ad') 
              ? (p.oid || p.sub) 
              : p.sub

            const email = (p.email || p.preferred_username)?.toLowerCase().trim()

            if (providerSubject && email) {
              // Wrap DB operations in a shorter timeout to prevent Auth hang
              const user = await Promise.race([
                (async () => {
                  const identity = await prisma.userIdentity.findUnique({
                    where: {
                      provider_providerSubject: {
                        provider: authProvider,
                        providerSubject: providerSubject
                      }
                    },
                    include: { user: true }
                  })

                  if (identity?.user) return identity.user

                  // If not found, try finding User by email
                  let dbUser = await prisma.user.findFirst({
                    where: { email: email }
                  })

                  if (!dbUser) {
                    dbUser = await prisma.user.create({
                      data: {
                        email: email,
                        displayName: p.name || email.split('@')[0],
                        profilePhotoUrl: p.picture || p.image || null,
                        entraUserId: (authProvider === 'azure_ad') ? providerSubject : null
                      }
                    })
                  } else if (authProvider === 'azure_ad' && !dbUser.entraUserId) {
                    dbUser = await prisma.user.update({
                      where: { id: dbUser.id },
                      data: { entraUserId: providerSubject }
                    })
                  }

                  // Ensure identity exists
                  await prisma.userIdentity.upsert({
                    where: {
                      provider_providerSubject: {
                        provider: authProvider,
                        providerSubject: providerSubject
                      }
                    },
                    update: { emailAtAuth: email },
                    create: {
                      userId: dbUser.id,
                      provider: authProvider,
                      providerSubject: providerSubject,
                      emailAtAuth: email
                    }
                  })

                  return dbUser
                })(),
                new Promise<null>((_, reject) => 
                  setTimeout(() => reject(new Error("Database timeout")), 7000)
                )
              ])
              
              if (user) {
                token.id = user.id
                if (user.entraUserId) token.entraUserId = user.entraUserId
              }
            }
          }
        } catch (error) {
          console.error("DB Auth Linking Failed (skipping to prevent hang):", error)
          // We don't throw here, so the user can still log in via OAuth even if DB link fails
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string // Expose DB ID
        session.user.entraUserId = token.entraUserId
        session.user.email = token.email || session.user.email
        session.user.name = token.displayName || session.user.name
        session.user.provider = token.provider
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

