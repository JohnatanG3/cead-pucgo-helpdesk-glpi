import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authenticateWithGLPI } from "@/lib/auth-glpi"

// Interface para o usuário autenticado
interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role?: string
  sessionToken?: string
  refreshToken?: string
  expiresAt?: number
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("NextAuth: Credenciais ausentes")
          return null
        }

        try {
          console.log("NextAuth: Tentando autenticar com credenciais:", credentials.username) // Log de depuração

          const result = await authenticateWithGLPI(credentials.username, credentials.password)

          console.log("NextAuth: Resultado da autenticação:", { success: result.success, error: result.error }) // Log de depuração

          if (!result.success || !result.user) {
            console.log("NextAuth: Autenticação falhou") // Log de depuração
            return null
          }

          // Retornar o usuário com os dados necessários
          const user: AuthenticatedUser = {
            id: result.user.id,
            name: result.user.name || "",
            email: result.user.email || "",
            role: result.user.role,
            sessionToken: result.sessionToken,
            refreshToken: result.refreshToken,
            expiresAt: result.expiresAt,
          }

          console.log("NextAuth: Usuário autenticado:", { id: user.id, name: user.name, role: user.role }) // Log de depuração

          return user
        } catch (error) {
          console.error("NextAuth: Erro na autenticação:", error) // Log de depuração
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("NextAuth: Callback JWT executando", {
        hasUser: !!user,
        tokenBefore: { id: token.id, role: token.role },
      })

      if (user) {
        // Usar asserção de tipo para informar ao TypeScript que estas propriedades existem
        const authUser = user as AuthenticatedUser
        token.id = authUser.id
        token.role = authUser.role
        token.sessionToken = authUser.sessionToken
        token.refreshToken = authUser.refreshToken
        token.expiresAt = authUser.expiresAt

        console.log("NextAuth: Token atualizado com dados do usuário", {
          id: token.id,
          role: token.role,
        })
      }
      return token
    },
    async session({ session, token }) {
      console.log("NextAuth: Callback Session executando", {
        hasToken: !!token,
        sessionBefore: { userId: session.user?.id, role: session.user?.role },
      })

      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        // Usar asserção de tipo para informar ao TypeScript que podemos adicionar estas propriedades
        ;(session.user as any).sessionToken = token.sessionToken
        ;(session.user as any).refreshToken = token.refreshToken
        ;(session.user as any).expiresAt = token.expiresAt

        console.log("NextAuth: Sessão atualizada com dados do token", {
          userId: session.user.id,
          role: session.user.role,
        })
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/?error=",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutos
  },
  secret: process.env.NEXTAUTH_SECRET || "seu-segredo-temporario-para-desenvolvimento",
  debug: process.env.NODE_ENV === "development",
}
