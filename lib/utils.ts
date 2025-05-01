import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrai as iniciais de um nome completo
 * @param name Nome completo da pessoa
 * @returns Iniciais (primeira letra do primeiro nome + primeira letra do último sobrenome)
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "U"

  const parts = name.trim().split(/\s+/)

  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  // Pega a primeira letra do primeiro nome e a primeira letra do último sobrenome
  const firstInitial = parts[0].charAt(0)
  const lastInitial = parts[parts.length - 1].charAt(0)

  return (firstInitial + lastInitial).toUpperCase()
}
