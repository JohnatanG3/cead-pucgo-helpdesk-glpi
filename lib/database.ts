import Database from "better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"

// Caminho para o banco de dados
const dbPath = path.join(process.cwd(), "data", "users.db")

// Criar diretório se não existir
import fs from "fs"
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Inicializar banco de dados
const db = new Database(dbPath)

// Criar tabelas se não existirem
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

// Criar índices
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
`)

// Interface para usuário
export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "user"
  department?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// Interface para criação de usuário
export interface CreateUserData {
  email: string
  password: string
  name: string
  role?: "admin" | "user"
  department?: string
}

// Função para criar usuário
export async function createUser(userData: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Validar email PUC
    if (!userData.email.endsWith("@pucgo.edu.br")) {
      return {
        success: false,
        error: "Email deve ser do domínio @pucgo.edu.br",
      }
    }

    // Verificar se usuário já existe
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(userData.email)
    if (existingUser) {
      return {
        success: false,
        error: "Usuário já cadastrado com este email",
      }
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(userData.password, 12)

    // Inserir usuário
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, department)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      userData.email,
      passwordHash,
      userData.name,
      userData.role || "user",
      userData.department || null,
    )

    // Buscar usuário criado
    const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as User

    return {
      success: true,
      user: {
        ...newUser,
        password_hash: undefined, // Não retornar hash da senha
      } as User,
    }
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return {
      success: false,
      error: "Erro interno do servidor",
    }
  }
}

// Função para autenticar usuário
export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Buscar usuário
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND is_active = 1").get(email) as any

    if (!user) {
      return {
        success: false,
        error: "Email ou senha incorretos",
      }
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return {
        success: false,
        error: "Email ou senha incorretos",
      }
    }

    // Retornar usuário sem hash da senha
    const { password_hash, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword as User,
    }
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return {
      success: false,
      error: "Erro interno do servidor",
    }
  }
}

// Função para buscar usuário por ID
export function getUserById(id: number): User | null {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ? AND is_active = 1").get(id) as any
    if (!user) return null

    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return null
  }
}

// Função para buscar usuário por email
export function getUserByEmail(email: string): User | null {
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND is_active = 1").get(email) as any
    if (!user) return null

    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return null
  }
}

// Função para listar todos os usuários (admin)
export function getAllUsers(): User[] {
  try {
    const users = db.prepare("SELECT * FROM users WHERE is_active = 1 ORDER BY created_at DESC").all() as any[]
    return users.map((user) => {
      const { password_hash, ...userWithoutPassword } = user
      return userWithoutPassword as User
    })
  } catch (error) {
    console.error("Erro ao listar usuários:", error)
    return []
  }
}

// Função para atualizar usuário
export async function updateUser(
  id: number,
  updates: Partial<CreateUserData>,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = getUserById(id)
    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      }
    }

    const updateFields: string[] = []
    const updateValues: any[] = []

    if (updates.name) {
      updateFields.push("name = ?")
      updateValues.push(updates.name)
    }

    if (updates.department !== undefined) {
      updateFields.push("department = ?")
      updateValues.push(updates.department)
    }

    if (updates.role) {
      updateFields.push("role = ?")
      updateValues.push(updates.role)
    }

    if (updates.password) {
      const passwordHash = await bcrypt.hash(updates.password, 12)
      updateFields.push("password_hash = ?")
      updateValues.push(passwordHash)
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        error: "Nenhum campo para atualizar",
      }
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(id)

    const stmt = db.prepare(`
      UPDATE users 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `)

    stmt.run(...updateValues)

    const updatedUser = getUserById(id)

    return {
      success: true,
      user: updatedUser!,
    }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return {
      success: false,
      error: "Erro interno do servidor",
    }
  }
}

// Criar usuário admin padrão se não existir
export function createDefaultAdmin() {
  try {
    const adminExists = db.prepare('SELECT id FROM users WHERE role = "admin"').get()

    if (!adminExists) {
      console.log("Criando usuário admin padrão...")
      createUser({
        email: "admin@pucgo.edu.br",
        password: "admin123",
        name: "Administrador CEAD",
        role: "admin",
        department: "CEAD",
      }).then((result) => {
        if (result.success) {
          console.log("Usuário admin padrão criado com sucesso!")
          console.log("Email: admin@pucgo.edu.br")
          console.log("Senha: admin123")
        }
      })
    }
  } catch (error) {
    console.error("Erro ao criar admin padrão:", error)
  }
}

// Inicializar admin padrão
createDefaultAdmin()

export default db
