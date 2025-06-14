"use client"

import type { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/lib/permissions"

interface PermissionGuardProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { can } = usePermissions()

  if (!can(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface RoleGuardProps {
  role: string | string[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
  const { role: userRole } = usePermissions()

  const allowedRoles = Array.isArray(role) ? role : [role]

  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
