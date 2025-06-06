"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AlertCircle } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter()

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

      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(errorMessages[result.error] || errorMessages.default)
      } else if (result?.ok) {
        // Redirecionar para a página apropriada após login bem-sucedido
        // O middleware cuidará do redirecionamento com base no tipo de usuário
        router.push("/dashboard")
        router.refresh()
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
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
