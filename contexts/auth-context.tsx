"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Definir o tipo de usuário
interface User {
  id: string
  name: string
  email: string
  role: string
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
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("sessionToken")

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Erro ao analisar dados do usuário:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
      }
    }

    setIsLoading(false)
  }, [])

  // Modificar a função login para garantir que o redirecionamento funcione corretamente
  const login = (userData: User, token: string) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("sessionToken", token)

    // Pequeno atraso para garantir que o estado seja atualizado antes do redirecionamento
    setTimeout(() => {
      // Redirecionar com base no papel do usuário
      if (userData.role === "admin") {
        window.location.href = "/admin"
      } else {
        window.location.href = "/dashboard"
      }
    }, 100)
  }

  // Função para fazer logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("sessionToken")
    router.push("/")
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
