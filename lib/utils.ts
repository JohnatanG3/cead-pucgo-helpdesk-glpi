import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes CSS com suporte a Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Obtém a primeira letra do email (para avatares)
 * @param email Endereço de email
 * @returns Primeira letra do email em maiúsculo
 */
export function getEmailInitial(email: string): string {
  if (!email || typeof email !== "string") return "U"
  return email.charAt(0).toUpperCase()
}

/**
 * Extrai um nome amigável de um endereço de email
 * @param email Endereço de email
 * @returns Nome amigável
 */
export function getNameFromEmail(email: string): string {
  if (!email || typeof email !== "string") return "Usuário"

  // Remove o domínio
  const localPart = email.split("@")[0]

  // Substitui pontos e underscores por espaços
  const nameWithSpaces = localPart.replace(/[._]/g, " ")

  // Capitaliza cada palavra
  return nameWithSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Formata uma data para exibição
 * @param date Data a ser formatada
 * @returns Data formatada
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Gera um ID único
 * @returns ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Trunca um texto para um tamanho máximo
 * @param text Texto a ser truncado
 * @param maxLength Tamanho máximo
 * @returns Texto truncado
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
