import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Estende o tipo User padrão do NextAuth
   */
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
    isAdmin?: boolean
    glpiToken?: string
    sessionToken?: string
    group_id?: string
    username?: string
    password?: string
  }

  /**
   * Estende o tipo Session padrão do NextAuth
   */
  interface Session extends DefaultSession {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      isAdmin?: boolean
      glpiToken?: string
    }
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
    sessionToken?: string
    username?: string
    password?: string
    error?: string
  }
}
