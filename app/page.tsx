"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import { mockUsers } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const usernameInputRef = useRef<HTMLInputElement>(null)

  // Focus automático no campo de usuário
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus()
    }
  }, [])

  // Verificar se há erro na URL
  const errorParam = searchParams.get("error")

  // Mapear erros de autenticação
  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Usuário ou senha inválidos.",
    session_expired: "Sua sessão expirou. Por favor, faça login novamente.",
    default: "Ocorreu um erro durante o login. Tente novamente.",
  }

  // Definir mensagem de erro com base no parâmetro
  useEffect(() => {
    if (errorParam) {
      setError(errorMessages[errorParam] || errorMessages.default)
    }
  }, [errorParam])

  // Função para extrair o primeiro nome do email
  const getFirstNameFromEmail = (email: string) => {
    const namePart = email.split("@")[0]
    const firstName = namePart.split(".")[0]
    return firstName.charAt(0).toUpperCase() + firstName.slice(1)
  }

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Verificar se estamos usando dados simulados
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || true

      if (useMockData) {
        // Simular delay de autenticação
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Autenticação com dados simulados
        const user = mockUsers.find((u) => u.email === username && u.password === password)

        if (user) {
          // Usar o contexto de autenticação para login
          login(user, "mock-session-token")

          // Mostrar toast de boas-vindas
          const firstName = getFirstNameFromEmail(user.email)
          toast.success(`Bem-vindo, ${firstName}!`, {
            description: "Login realizado com sucesso.",
            duration: 4000,
            style: {
              background: "#10b981",
              color: "white",
              border: "none",
            },
          })

          return
        } else {
          setError("Usuário ou senha inválidos.")
        }
      } else {
        // Autenticação real com NextAuth
        const result = await signIn("credentials", {
          username,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError(errorMessages[result.error] || errorMessages.default)
        } else if (result?.ok) {
          // Mostrar toast de boas-vindas
          const firstName = getFirstNameFromEmail(username)
          toast.success(`Bem-vindo, ${firstName}!`, {
            description: "Login realizado com sucesso.",
            duration: 4000,
            style: {
              background: "#10b981",
              color: "white",
              border: "none",
            },
          })

          router.push("/dashboard")
          router.refresh()
        }
      }
    } catch (err) {
      setError("Ocorreu um erro durante o login. Tente novamente.")
      console.error("Erro de login:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image src="/puc-goias.svg" alt="Logo PUC Goiás" width={200} height={80} className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold">Sistema de Chamados CEAD</h1>
          <p className="text-gray-600 mt-2">Centro de Excelência em Aprendizagem e Desenvolvimento</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>Entre com suas credenciais institucionais da PUC Goiás</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 border-red-600 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600 font-medium">Erro</AlertTitle>
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Usuário
                </label>
                <Input
                  ref={usernameInputRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu usuário PUC"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-sm text-gray-600">
            <p>Use suas credenciais institucionais da PUC Goiás para acessar o sistema.</p>
            <p>Em caso de problemas, entre em contato com o suporte do CEAD.</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-xs text-blue-800 font-medium mb-2">Credenciais para demonstração:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  <strong>Admin:</strong> admin@pucgoias.edu.br / admin123
                </p>
                <p>
                  <strong>Usuário:</strong> usuario@pucgoias.edu.br / user123
                </p>
                <p>
                  <strong>Suporte:</strong> suporte@pucgoias.edu.br / suporte123
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
