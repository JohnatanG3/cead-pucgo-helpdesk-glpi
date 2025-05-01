import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Adicione ou modifique a função getInitials para garantir que ela lide corretamente com o email "johnatan.g3@gmail.com"

export function getInitials(name: string | null | undefined): string {
  console.log("getInitials input:", name)

  if (!name) return "?"

  // Se for um email, extrair a parte antes do @
  if (name.includes("@")) {
    const username = name.split("@")[0]
    console.log("Email detectado, username:", username)

    // Se o username contiver um ponto, pegar a primeira letra de cada parte
    if (username.includes(".")) {
      const parts = username.split(".")
      console.log("Username com ponto, partes:", parts)
      return (parts[0][0] || "?").toUpperCase()
    }

    // Caso contrário, retornar a primeira letra do username
    return (username[0] || "?").toUpperCase()
  }

  // Para nomes regulares, pegar a primeira letra de cada palavra
  const initials = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  console.log("Initials result:", initials)
  return initials || "?"
}
