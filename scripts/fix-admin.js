const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")

async function fixAdmin() {
  console.log("🔧 Corrigindo usuário admin...")

  const dbPath = path.join(process.cwd(), "data", "users.db")
  const db = new Database(dbPath)

  // Verificar estrutura da tabela
  const tableInfo = db.prepare("PRAGMA table_info(users)").all()
  console.log("📋 Estrutura da tabela:")
  tableInfo.forEach((col) => {
    console.log(`- ${col.name}: ${col.type}`)
  })

  // Verificar admin atual
  const admin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@pucgo.edu.br")
  console.log("\n👤 Admin atual:")
  console.log("ID:", admin.id)
  console.log("Email:", admin.email)
  console.log("Nome:", admin.name)
  console.log("Role:", admin.role)
  console.log("Password field:", admin.password)
  console.log("Password_hash field:", admin.password_hash)

  // Gerar nova senha hash
  console.log("\n🔐 Gerando nova senha...")
  const newPasswordHash = await bcrypt.hash("admin123", 12)

  // Tentar atualizar com diferentes nomes de coluna
  try {
    // Primeiro tentar com 'password'
    db.prepare("UPDATE users SET password = ? WHERE email = ?").run(newPasswordHash, "admin@pucgo.edu.br")
    console.log("✅ Senha atualizada no campo 'password'")
  } catch (error) {
    console.log("❌ Erro ao atualizar campo 'password':", error.message)
  }

  try {
    // Depois tentar com 'password_hash'
    db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(newPasswordHash, "admin@pucgo.edu.br")
    console.log("✅ Senha atualizada no campo 'password_hash'")
  } catch (error) {
    console.log("❌ Erro ao atualizar campo 'password_hash':", error.message)
  }

  // Verificar se funcionou
  const updatedAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@pucgo.edu.br")
  console.log("\n🔍 Admin após atualização:")
  console.log("Password field:", updatedAdmin.password ? "✅ Preenchido" : "❌ Vazio")
  console.log("Password_hash field:", updatedAdmin.password_hash ? "✅ Preenchido" : "❌ Vazio")

  // Testar a senha
  const passwordToTest = updatedAdmin.password || updatedAdmin.password_hash
  if (passwordToTest) {
    const isValid = await bcrypt.compare("admin123", passwordToTest)
    console.log("Senha válida:", isValid ? "✅ SIM" : "❌ NÃO")
  }

  db.close()
  console.log("\n🎉 Correção concluída!")
}

fixAdmin().catch(console.error)
