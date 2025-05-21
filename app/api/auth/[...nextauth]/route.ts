import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authenticateWithGLPI, renewGLPIToken, renewGLPITokenWithCredentials } from "@/lib/auth-glpi"

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
          // Autenticação real com o GLPI
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
            isAdmin: result.user.role === "admin",
            glpiToken: result.sessionToken,
            refreshToken: result.refreshToken,
            tokenExpiresAt: result.expiresAt,
            // Armazenar credenciais para renovação (em produção, usar criptografia)
            username: credentials.email,
            password: credentials.password,
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Passar dados do usuário para o token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isAdmin = user.isAdmin
        token.glpiToken = user.glpiToken
        token.refreshToken = user.refreshToken
        token.tokenExpiresAt = user.tokenExpiresAt
        token.username = user.username
        token.password = user.password
      }

      // Verificar se o token GLPI está prestes a expirar (menos de 5 minutos)
      if (token.tokenExpiresAt && Date.now() > (token.tokenExpiresAt as number) - 5 * 60 * 1000) {
        console.log("Token GLPI está prestes a expirar, tentando renovar...")

        // Tentar renovar com refresh token primeiro
        if (token.refreshToken) {
          const newTokens = await renewGLPIToken(token.refreshToken as string)

          if (newTokens) {
            console.log("Token GLPI renovado com sucesso usando refresh token")
            token.glpiToken = newTokens.sessionToken
            token.refreshToken = newTokens.refreshToken
            token.tokenExpiresAt = newTokens.expiresAt
            return token
          }
        }

        // Se não conseguir renovar com refresh token, tentar com credenciais
        if (token.username && token.password) {
          const newTokens = await renewGLPITokenWithCredentials(token.username as string, token.password as string)

          if (newTokens) {
            console.log("Token GLPI renovado com sucesso usando credenciais")
            token.glpiToken = newTokens.sessionToken
            token.refreshToken = newTokens.refreshToken
            token.tokenExpiresAt = newTokens.expiresAt
            return token
          }
        }

        // Se não conseguir renovar, forçar novo login
        console.error("Não foi possível renovar o token GLPI")
        token.error = "RefreshAccessTokenError"
      }

      return token
    },
    async session({ session, token }) {
      // Passar dados do token para a sessão
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string | undefined
        session.user.isAdmin = token.isAdmin as boolean | undefined
        session.user.glpiToken = token.glpiToken as string | undefined
        session.error = token.error as string | undefined

        // Adicionar informações de expiração para o cliente
        session.expires = new Date((token.tokenExpiresAt as number) || Date.now() + 3600 * 1000).toISOString()
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
})

export { handler as GET, handler as POST }
