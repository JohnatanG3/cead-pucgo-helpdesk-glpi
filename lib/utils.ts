import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrai as iniciais de um nome completo
 * @param name Nome completo
 * @returns Iniciais (primeira letra do primeiro nome e primeira letra do último nome)
 */
export function getInitials(name: string): string {
  if (!name) return "U"

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  const firstName = parts[0]
  const lastName = parts[parts.length - 1]

  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
}

/**
 * Extrai a primeira letra do email do usuário
 * @param email Email do usuário
 * @returns Primeira letra do email, em maiúsculo
 */
export function getEmailInitial(email: string): string {
  if (!email || typeof email !== "string") return "U"

  // Pega apenas a primeira letra do email, antes do @
  const firstLetter = email.trim().charAt(0)
  return firstLetter.toUpperCase()
}
