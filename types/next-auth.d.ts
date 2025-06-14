import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Estende o tipo User padrão do NextAuth
   */
  interface User {
    id: string
    role?: string
    isAdmin?: boolean
    glpiToken?: string
    refreshToken?: string
    tokenExpiresAt?: number
    username?: string
    password?: string
  }

  /**
   * Estende o tipo Session padrão do NextAuth
   */
  interface Session extends DefaultSession {
    user: {
      id: string
      role?: string
      isAdmin?: boolean
      glpiToken?: string
    } & DefaultSession["user"]
    error?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Estende o tipo JWT padrão do NextAuth
   */
  interface JWT {
    id?: string
    role?: string
    isAdmin?: boolean
    glpiToken?: string
    refreshToken?: string
    tokenExpiresAt?: number
    username?: string
    password?: string
    error?: string
  }
}
