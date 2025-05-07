"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Shield } from "lucide-react"
import { toast } from "sonner"

import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getEmailInitial } from "@/lib/utils"

export default function AdminProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState("")
  const [department, setDepartment] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Get user initial for avatar
  const userInitial = user?.email ? getEmailInitial(user.email) : "A"

  // Extract name from email if available
  const emailName = user?.email ? user.email.split("@")[0] : ""
  const displayName = user?.name || emailName || "Administrador"

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Perfil atualizado com sucesso!")
      setIsLoading(false)
    }, 1000)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Senha alterada com sucesso!")
      setIsLoading(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader isAdmin={true} />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.push("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <Card className="w-full md:w-1/3">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4">{displayName}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium text-primary">Administrador</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="w-full md:w-2/3">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="security">Segurança</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Pessoais</CardTitle>
                      <CardDescription>Atualize suas informações de perfil</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleUpdateProfile}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome completo"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={user?.email} disabled placeholder="admin@pucgoias.edu.br" />
                          <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(62) 99999-9999"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="department">Departamento</Label>
                          <Input
                            id="department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Ex: CEAD - Coordenação"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-6">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Segurança</CardTitle>
                      <CardDescription>Gerencie sua senha e configurações de segurança</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleChangePassword}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Senha Atual</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nova Senha</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-6">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Alterando..." : "Alterar Senha"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CEAD - Coordenação de Educação a Distância - PUC GO. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="/termo-de-uso" className="text-sm text-muted-foreground hover:underline">
              Termos de Uso
            </a>
            <a href="/politica-de-privacidade" className="text-sm text-muted-foreground hover:underline">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
