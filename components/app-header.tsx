"use client"

import Link from "next/link"
import { ChevronDown, LogOut, User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { getEmailInitial } from "@/lib/utils"

interface AppHeaderProps {
  isAdmin?: boolean
}

export function AppHeader({ isAdmin = false }: AppHeaderProps) {
  const { user, logout } = useAuth()

  // Usar o email para o avatar, ou fallback para 'A' (Admin) ou 'U' (Usuário)
  const avatarInitial = user?.email ? getEmailInitial(user.email) : isAdmin ? "A" : "U"

  // Determinar o link e o texto do cabeçalho com base no tipo de usuário
  const headerLink = isAdmin ? "/admin" : "/dashboard"
  const headerText = isAdmin ? "CEAD - PUC GO (Admin)" : "CEAD - PUC GO"

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-cead-blue text-white">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href={headerLink}>
            <div className="flex items-center gap-2">
              <img src="/puc-goias.svg" alt="Logo PUC Goiás" className="h-8 w-8" />
              <span className="text-lg font-semibold">{headerText}</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{avatarInitial}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex">{user?.email || (isAdmin ? "Administrador" : "Usuário")}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={isAdmin ? "/admin/profile" : "/dashboard/profile"}>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
