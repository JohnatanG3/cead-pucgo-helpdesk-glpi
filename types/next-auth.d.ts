import "next-auth"

declare module "next-auth" {
  /**
   * Estende o tipo User padrão do NextAuth
   */
  interface User {
    role?: string
    sessionToken?: string
  }

  /**
   * Estende o tipo Session padrão do NextAuth
   */
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      sessionToken?: string
    }
  }
}

declare module "next-auth/jwt" {
  /**
   * Estende o tipo JWT padrão do NextAuth
   */
  interface JWT {
    role?: string
    sessionToken?: string
  }
}
