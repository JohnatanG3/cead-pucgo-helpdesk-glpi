import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authenticateWithGLPI } from "@/lib/auth-glpi"

// Configuração do NextAuth para autenticação com GLPI
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "GLPI",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu.email@pucgoias.edu.br" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Modo de desenvolvimento - aceita qualquer credencial válida
          if (process.env.NODE_ENV === "development") {
            const isAdmin = credentials.email.includes("admin") || credentials.email.includes("suporte")

            return {
              id: "1",
              name: isAdmin ? "Administrador" : "Usuário",
              email: credentials.email,
              role: isAdmin ? "admin" : "user",
              sessionToken: "dev-session-token",
            }
          }

          // Autenticação real com o GLPI para produção
          const result = await authenticateWithGLPI(credentials.email, credentials.password)

          if (!result.success || !result.user) {
            console.error("Falha na autenticação:", result.error)
            return null
          }

          // Se a autenticação foi bem-sucedida, retorna os dados do usuário
          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            sessionToken: result.sessionToken,
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.sessionToken = user.sessionToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.sessionToken = token.sessionToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
