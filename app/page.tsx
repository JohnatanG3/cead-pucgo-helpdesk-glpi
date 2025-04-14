"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authenticateWithGLPI } from "@/lib/auth-glpi"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user, login } = useAuth()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, router])

  // Focar no campo de e-mail quando a página carregar
  useEffect(() => {
    // Pequeno atraso para garantir que o componente esteja totalmente renderizado
    const timer = setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Autenticar usando nossa função
      const result = await authenticateWithGLPI(email, password)

      if (!result.success || !result.user) {
        // Mostrar mensagem de erro
        toast.error(result.error || "Email ou senha incorretos")
        setIsLoading(false)
        return
      }

      // Mostrar mensagem de sucesso
      toast.success(`Bem-vindo, ${result.user.name}!`)

      // Usar a função de login do contexto de autenticação
      login(result.user, result.sessionToken || "")

      // Não precisamos fazer o redirecionamento aqui, pois a função login já fará isso
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      toast.error("Ocorreu um erro ao tentar fazer login. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="mb-8 flex flex-col items-center">
        <img src="/puc-goias.svg" alt="Logo CEAD PUC GO" className="h-20 w-30 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">CEAD - PUC GO</h1>
        <p className="text-slate-600">Sistema de Abertura de Chamados</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Acesso ao Sistema</CardTitle>
          <CardDescription>Entre com suas credenciais para acessar o sistema de chamados.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@pucgoias.edu.br"
                required
                ref={emailInputRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Dica: Use um email com "admin" ou "suporte" para acessar o painel administrativo.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex justify-end">
                <Link href="#" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-cead-blue hover:bg-cead-light-blue text-white"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
