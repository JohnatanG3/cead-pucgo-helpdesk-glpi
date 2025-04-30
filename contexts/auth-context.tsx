"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Definir o tipo de usuário
interface User {
  id: string
  name: string
  email: string
  role: string
  group_id?: string // Adicionado group_id como propriedade opcional
}

// Definir o tipo do contexto de autenticação
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

// Componente provedor
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("sessionToken")

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          console.log("Usuário autenticado:", parsedUser)
        } catch (error) {
          console.error("Erro ao analisar dados do usuário:", error)
          localStorage.removeItem("user")
          localStorage.removeItem("sessionToken")
        }
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
    } finally {
      // Sempre definir isLoading como false, mesmo em caso de erro
      setIsLoading(false)
    }
  }, [])

  // Função de login modificada para usar window.location.href para redirecionamento
  const login = (userData: User, token: string) => {
    try {
      console.log("Login iniciado para:", userData)
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("sessionToken", token)

      // Usar window.location.href para garantir um redirecionamento completo
      if (userData.role === "admin") {
        console.log("Redirecionando para /admin")
        window.location.href = "/admin"
      } else {
        console.log("Redirecionando para /dashboard")
        window.location.href = "/dashboard"
      }
    } catch (error) {
      console.error("Erro durante o login:", error)
    }
  }

  // Função para fazer logout
  const logout = () => {
    try {
      console.log("Logout iniciado")
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("sessionToken")

      // Usar window.location.href para garantir um redirecionamento completo
      window.location.href = "/"
    } catch (error) {
      console.error("Erro durante o logout:", error)
      // Em caso de erro, tentar redirecionamento direto
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
