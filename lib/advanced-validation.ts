import { z } from "zod"

// Tipos de validação
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
  firstError?: string
}

// Esquemas de validação comuns
export const emailSchema = z.string().min(1, "O e-mail é obrigatório").email("Formato de e-mail inválido")

export const passwordSchema = z
  .string()
  .min(6, "A senha deve ter pelo menos 6 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")

export const nameSchema = z
  .string()
  .min(3, "O nome deve ter pelo menos 3 caracteres")
  .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/, "O nome deve conter apenas letras e espaços")

export const phoneSchema = z
  .string()
  .regex(/^$$\d{2}$$ \d{4,5}-\d{4}$/, "Formato de telefone inválido. Use (99) 99999-9999")

export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "Formato de CPF inválido. Use 999.999.999-99")
  .refine((cpf) => {
    // Remover caracteres não numéricos
    const numericCpf = cpf.replace(/[^\d]/g, "")

    // Verificar se tem 11 dígitos
    if (numericCpf.length !== 11) return false

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numericCpf)) return false

    // Validação do primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(numericCpf.charAt(i)) * (10 - i)
    }
    const remainder = sum % 11
    const digit1 = remainder < 2 ? 0 : 11 - remainder

    if (Number.parseInt(numericCpf.charAt(9)) !== digit1) return false

    // Validação do segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(numericCpf.charAt(i)) * (11 - i)
    }
    const remainder2 = sum % 11
    const digit2 = remainder2 < 2 ? 0 : 11 - remainder2

    return Number.parseInt(numericCpf.charAt(10)) === digit2
  }, "CPF inválido")

// Função para validar dados com Zod e retornar um resultado padronizado
export function validate<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}

      error.errors.forEach((err) => {
        const path = err.path.join(".") || "value"
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })

      return {
        success: false,
        errors,
        firstError: error.errors[0]?.message,
      }
    }

    return {
      success: false,
      errors: { _general: ["Ocorreu um erro de validação"] },
      firstError: "Ocorreu um erro de validação",
    }
  }
}

// Validação para o formulário de chamado
export const ticketFormSchema = z.object({
  title: z
    .string()
    .min(5, "O título deve ter pelo menos 5 caracteres")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    errorMap: () => ({ message: "Selecione uma prioridade válida" }),
  }),
})

export type TicketFormData = z.infer<typeof ticketFormSchema>

// Validação para o formulário de perfil
export const profileFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().nullable(),
  department: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

// Esquema para validação de comentários
export const commentSchema = z.string().min(3, "O comentário deve ter pelo menos 3 caracteres")

// Exportar funções e tipos principais
export const validation = {
  validate,
  schemas: {
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
    phone: phoneSchema,
    cpf: cpfSchema,
    ticketForm: ticketFormSchema,
    profileForm: profileFormSchema,
    comment: commentSchema,
  },
}

export default validation
