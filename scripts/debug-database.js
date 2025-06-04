const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")

async function debugDatabase() {
  console.log("🔍 Debugando banco de dados...")

  const dbPath = path.join(process.cwd(), "data", "users.db")

  if (!require("fs").existsSync(dbPath)) {
    console.log("❌ Banco de dados não existe!")
    return
  }

  const db = new Database(dbPath)

  // Listar todos os usuários
  const users = db.prepare("SELECT * FROM users").all()
  console.log("👥 Usuários no banco:", users.length)

  users.forEach((user) => {
    console.log(`- ID: ${user.id}, Email: ${user.email}, Nome: ${user.name}, Role: ${user.role}`)
  })

  // Testar senha do admin
  const admin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@pucgo.edu.br")

  if (admin) {
    console.log("\n🔐 Testando senha do admin...")
    const isValidPassword = await bcrypt.compare("admin123", admin.password)
    console.log("Senha válida:", isValidPassword)

    if (!isValidPassword) {
      console.log("❌ Senha incorreta! Vamos resetar...")
      const newHash = await bcrypt.hash("admin123", 12)
      db.prepare("UPDATE users SET password = ? WHERE email = ?").run(newHash, "admin@pucgo.edu.br")
      console.log("✅ Senha resetada!")
    }
  } else {
    console.log("❌ Admin não encontrado!")
  }

  db.close()
}

debugDatabase().catch(console.error)
