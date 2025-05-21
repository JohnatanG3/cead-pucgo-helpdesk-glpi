// Definição de permissões e papéis para o sistema

// Tipos de permissões disponíveis
export enum Permission {
  // Permissões de visualização
  VIEW_OWN_TICKETS = "view:own_tickets",
  VIEW_ALL_TICKETS = "view:all_tickets",
  VIEW_REPORTS = "view:reports",
  VIEW_USERS = "view:users",
  VIEW_CATEGORIES = "view:categories",

  // Permissões de criação
  CREATE_TICKET = "create:ticket",
  CREATE_CATEGORY = "create:category",
  CREATE_USER = "create:user",

  // Permissões de edição
  EDIT_OWN_TICKET = "edit:own_ticket",
  EDIT_ANY_TICKET = "edit:any_ticket",
  EDIT_CATEGORY = "edit:category",
  EDIT_USER = "edit:user",

  // Permissões de exclusão
  DELETE_OWN_TICKET = "delete:own_ticket",
  DELETE_ANY_TICKET = "delete:any_ticket",
  DELETE_CATEGORY = "delete:category",
  DELETE_USER = "delete:user",

  // Permissões de atribuição
  ASSIGN_TICKET = "assign:ticket",

  // Permissões de administração
  MANAGE_SYSTEM = "manage:system",
}

// Interface para definir um papel
export interface Role {
  name: string
  description: string
  permissions: Permission[]
}

// Definição dos papéis disponíveis
export const Roles: Record<string, Role> = {
  USER: {
    name: "user",
    description: "Usuário comum",
    permissions: [Permission.VIEW_OWN_TICKETS, Permission.CREATE_TICKET, Permission.EDIT_OWN_TICKET],
  },
  SUPPORT: {
    name: "support",
    description: "Suporte técnico",
    permissions: [
      Permission.VIEW_OWN_TICKETS,
      Permission.VIEW_ALL_TICKETS,
      Permission.CREATE_TICKET,
      Permission.EDIT_OWN_TICKET,
      Permission.EDIT_ANY_TICKET,
      Permission.ASSIGN_TICKET,
    ],
  },
  MANAGER: {
    name: "manager",
    description: "Gerente",
    permissions: [
      Permission.VIEW_OWN_TICKETS,
      Permission.VIEW_ALL_TICKETS,
      Permission.VIEW_REPORTS,
      Permission.CREATE_TICKET,
      Permission.EDIT_OWN_TICKET,
      Permission.EDIT_ANY_TICKET,
      Permission.DELETE_ANY_TICKET,
      Permission.ASSIGN_TICKET,
    ],
  },
  ADMIN: {
    name: "admin",
    description: "Administrador",
    permissions: Object.values(Permission),
  },
}

// Função para verificar se um papel tem uma permissão específica
export function hasPermission(role: string, permission: Permission): boolean {
  const roleObj = Roles[role.toUpperCase()]
  if (!roleObj) return false

  return roleObj.permissions.includes(permission)
}

// Função para obter todas as permissões de um papel
export function getRolePermissions(role: string): Permission[] {
  const roleObj = Roles[role.toUpperCase()]
  if (!roleObj) return []

  return [...roleObj.permissions]
}

// Função para mapear papel do GLPI para papel do sistema
export function mapGLPIRoleToSystemRole(glpiRole: string): string {
  // Mapeamento de papéis do GLPI para papéis do sistema
  const roleMap: Record<string, string> = {
    "super-admin": "ADMIN",
    admin: "ADMIN",
    technician: "SUPPORT",
    supervisor: "MANAGER",
    observer: "USER",
    "self-service": "USER",
  }

  return roleMap[glpiRole.toLowerCase()] || "USER"
}
