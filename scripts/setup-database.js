const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")
const Database = require("better-sqlite3")

async function setupDatabase() {
  console.log("🚀 Configurando banco de dados...")

  // Criar pasta data se não existir
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    console.log("📁 Criando pasta data...")
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Conectar ao banco
  const dbPath = path.join(dataDir, "users.db")
  const db = new Database(dbPath)

  // Criar tabela com a estrutura correta
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `)

  // Verificar se admin já existe
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@pucgo.edu.br")

  if (existingAdmin) {
    console.log("✅ Usuário admin já existe!")
    console.log("📧 Email: admin@pucgo.edu.br")
    console.log("🔑 Senha: admin123")

    // Verificar se a senha está correta
    const isValidPassword = await bcrypt.compare("admin123", existingAdmin.password_hash || existingAdmin.password)
    if (!isValidPassword) {
      console.log("🔄 Atualizando senha do admin...")
      const newHash = await bcrypt.hash("admin123", 12)
      db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(newHash, "admin@pucgo.edu.br")
      console.log("✅ Senha atualizada!")
    }

    db.close()
    return
  }

  // Criar admin
  console.log("👤 Criando usuário administrador...")

  const hashedPassword = await bcrypt.hash("admin123", 12)

  try {
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, department, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run("admin@pucgo.edu.br", hashedPassword, "Administrador CEAD", "admin", "CEAD", 1)

    console.log("✅ Admin criado com sucesso!")
    console.log("📧 Email: admin@pucgo.edu.br")
    console.log("🔑 Senha: admin123")
    console.log("")
    console.log("🎉 Banco de dados configurado! Você pode fazer login agora.")
  } catch (error) {
    console.log("❌ Erro ao criar admin:", error.message)
  }

  db.close()
}

setupDatabase().catch((error) => {
  console.error("❌ Erro na configuração:", error)
  process.exit(1)
})
