import { createUser } from "../lib/database"

async function createAdmin() {
  console.log("Criando usuário administrador...")

  const result = await createUser({
    email: "admin@pucgo.edu.br",
    password: "admin123",
    name: "Administrador CEAD",
    role: "admin",
    department: "CEAD",
  })

  if (result.success) {
    console.log("✅ Admin criado com sucesso!")
    console.log("📧 Email: admin@pucgo.edu.br")
    console.log("🔑 Senha: admin123")
  } else {
    console.log("❌ Erro ao criar admin:", result.error)
  }
}

createAdmin().catch(console.error)
