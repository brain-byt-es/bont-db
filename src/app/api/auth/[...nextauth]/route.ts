import NextAuth from "next-auth/next"
import { AuthOptions, DefaultSession } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import prisma from "@/lib/prisma"

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
              // a) Lookup UserIdentity
              const identity = await prisma.userIdentity.findUnique({
                where: {
                  provider_providerSubject: {
                    provider: authProvider,
                    providerSubject: providerSubject
                  }
                },
                include: { user: true }
              })

              let user = identity?.user ?? null

              // b) If not found, try finding User by email
              if (!user) {
                user = await prisma.user.findFirst({
                  where: { email: email }
                })

                // c) If still no user, create User
                if (!user) {
                  user = await prisma.user.create({
                    data: {
                      email: email,
                      displayName: p.name || email.split('@')[0],
                      profilePhotoUrl: p.picture || p.image || null,
                      // For Azure AD, we can set entraUserId immediately if not present
                      entraUserId: (authProvider === 'azure_ad') ? providerSubject : null
                    }
                  })
                } else if (authProvider === 'azure_ad' && !user.entraUserId) {
                  // f) Link entraUserId if missing
                   user = await prisma.user.update({
                    where: { id: user.id },
                    data: { entraUserId: providerSubject }
                   })
                }

                // e) Create Identity linking
                if (!identity) {
                  await prisma.userIdentity.create({
                    data: {
                      userId: user!.id,
                      provider: authProvider,
                      providerSubject: providerSubject,
                      emailAtAuth: email
                    }
                  })
                }
              }
              
              // Persist DB User ID to token
              if (user) {
                token.id = user.id
                // Ensure token has the latest entraUserId if it was just linked
                if (user.entraUserId) {
                   token.entraUserId = user.entraUserId
                }
              }
            }
          }
        } catch (error) {
          console.error("DB Auth Linking Failed:", error)
          // Fallback: Login proceeds without DB linking, token keeps standard mapped values
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

