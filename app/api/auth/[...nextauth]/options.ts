import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authenticateWithDatabase } from "@/lib/auth-real"
import "@/lib/database" // Força a inicialização do banco de dados

// Interface para o usuário autenticado
interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role?: string
  sessionToken?: string
  department?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("NextAuth: Credenciais ausentes")
          return null
        }

        try {
          console.log("NextAuth: Tentando autenticar com banco de dados:", credentials.username)

          const result = await authenticateWithDatabase(credentials.username, credentials.password)

          console.log("NextAuth: Resultado da autenticação:", { success: result.success, error: result.error })

          if (!result.success || !result.user) {
            console.log("NextAuth: Autenticação falhou")
            return null
          }

          // Retornar o usuário com os dados necessários
          const user: AuthenticatedUser = {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            sessionToken: result.sessionToken,
            department: result.user.department,
          }

          console.log("NextAuth: Usuário autenticado:", { id: user.id, name: user.name, role: user.role })

          return user
        } catch (error) {
          console.error("NextAuth: Erro na autenticação:", error)
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
        const authUser = user as AuthenticatedUser
        token.id = authUser.id
        token.role = authUser.role
        token.sessionToken = authUser.sessionToken
        token.department = authUser.department

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
        ;(session.user as any).sessionToken = token.sessionToken
        ;(session.user as any).department = token.department

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
    maxAge: 8 * 60 * 60, // 8 horas
  },
  secret: process.env.NEXTAUTH_SECRET || "seu-segredo-temporario-para-desenvolvimento",
  debug: process.env.NODE_ENV === "development",
}
