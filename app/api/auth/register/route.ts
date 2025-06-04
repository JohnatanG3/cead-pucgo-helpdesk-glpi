import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, department } = body

    // Validações
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    if (!email.endsWith("@pucgo.edu.br")) {
      return NextResponse.json({ error: "Email deve ser do domínio @pucgo.edu.br" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Criar usuário
    const result = await createUser({
      name,
      email,
      password,
      department,
      role: "user", // Usuários normais por padrão
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      user: {
        id: result.user!.id,
        name: result.user!.name,
        email: result.user!.email,
        role: result.user!.role,
        department: result.user!.department,
      },
    })
  } catch (error) {
    console.error("Erro na API de cadastro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
