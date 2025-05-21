import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { Permission, hasPermission } from "@/lib/permissions"

// Mapeamento de rotas para permissões necessárias
const routePermissions: Record<string, Permission> = {
  "/admin": Permission.MANAGE_SYSTEM,
  "/admin/tickets": Permission.VIEW_ALL_TICKETS,
  "/admin/reports": Permission.VIEW_REPORTS,
  "/admin/categories": Permission.VIEW_CATEGORIES,
  "/admin/users": Permission.VIEW_USERS,
  "/dashboard/tickets": Permission.VIEW_OWN_TICKETS,
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar token de autenticação
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Verificar se o usuário está autenticado
  const isAuthenticated = !!token

  // Verificar se o token GLPI precisa ser renovado
  const needsTokenRefresh = token?.error === "RefreshAccessTokenError"

  // Redirecionar para login se não estiver autenticado e tentar acessar rota protegida
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirecionar para login se o token precisar ser renovado
  if (needsTokenRefresh) {
    return NextResponse.redirect(new URL("/?error=session_expired", request.url))
  }

  // Verificar permissões para rotas específicas
  if (isAuthenticated) {
    const userRole = (token.role as string) || "user"

    // Verificar permissões para a rota atual
    for (const [route, permission] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route) && !hasPermission(userRole, permission)) {
        // Redirecionar para dashboard se não tiver permissão
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Redirecionar usuário já autenticado da página inicial para o dashboard
    if (pathname === "/") {
      const redirectUrl = hasPermission(userRole, Permission.MANAGE_SYSTEM) ? "/admin" : "/dashboard"
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  return NextResponse.next()
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
