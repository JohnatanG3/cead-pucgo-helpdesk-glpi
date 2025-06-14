"use client"

import { useSession } from "next-auth/react"
import { useAuth } from "@/contexts/auth-context"
import { type Permission, hasPermission, getRolePermissions } from "@/lib/permissions"

export function usePermissions() {
  const { data: session } = useSession()
  const { user } = useAuth()

  // Determinar o papel do usuário (preferir sessão, fallback para contexto de auth)
  const role = session?.user?.role || user?.role || "user"

  // Verificar se o usuário tem uma permissão específica
  const can = (permission: Permission): boolean => {
    return hasPermission(role, permission)
  }

  // Obter todas as permissões do usuário
  const getAllPermissions = (): Permission[] => {
    return getRolePermissions(role)
  }

  // Verificar se o usuário é administrador
  const isAdmin = role === "admin"

  // Verificar se o usuário é gerente ou superior
  const isManagerOrAbove = ["admin", "manager"].includes(role)

  // Verificar se o usuário é suporte ou superior
  const isSupportOrAbove = ["admin", "manager", "support"].includes(role)

  return {
    role,
    can,
    getAllPermissions,
    isAdmin,
    isManagerOrAbove,
    isSupportOrAbove,
  }
}
