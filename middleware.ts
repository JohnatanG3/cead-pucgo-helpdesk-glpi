import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/", "/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verifica se a rota atual é pública
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Em ambiente de desenvolvimento, permitir acesso a todas as rotas
  // Isso é necessário porque estamos usando localStorage para autenticação
  // e o middleware é executado no servidor, não tendo acesso ao localStorage
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  // Em produção, verificaria um cookie ou token JWT
  const authCookie = request.cookies.get("auth")

  // Se não estiver autenticado, redireciona para a página de login
  if (!authCookie) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Permite o acesso se o usuário estiver autenticado
  return NextResponse.next()
}

// Configuração para aplicar o middleware apenas nas rotas especificadas
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
