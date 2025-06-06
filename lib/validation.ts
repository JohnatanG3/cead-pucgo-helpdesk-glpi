import { z } from "zod"

// Schema para validação de novo chamado
export const ticketSchema = z
  .object({
    title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
    category: z.string().nonempty("Selecione uma categoria"),
    priority: z.string().nonempty("Selecione uma prioridade"),
    description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres"),
    assignmentType: z.enum(["none", "user", "group"]),
    assignedUser: z.string().optional(),
    assignedGroup: z.string().optional(),
  })
  .refine(
    (data) => {
      // Se o tipo de atribuição for "user", o usuário atribuído deve ser fornecido
      if (data.assignmentType === "user") {
        return !!data.assignedUser
      }
      // Se o tipo de atribuição for "group", o grupo atribuído deve ser fornecido
      if (data.assignmentType === "group") {
        return !!data.assignedGroup
      }
      return true
    },
    {
      message: "Selecione um técnico ou grupo para atribuição",
      path: ["assignmentType"],
    },
  )

// Schema para validação de comentário em chamado
export const commentSchema = z.object({
  content: z.string().min(5, "O comentário deve ter pelo menos 5 caracteres"),
})

// Função auxiliar para validar dados com um schema Zod
export function validateData<T>(
  schema: z.ZodType<T>,
  data: any,
): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Formatar erros para uso na UI
  const formattedErrors: Record<string, string[]> = {}

  result.error.errors.forEach((err) => {
    const path = err.path.join(".")
    if (!formattedErrors[path]) {
      formattedErrors[path] = []
    }
    formattedErrors[path].push(err.message)
  })

  return { success: false, errors: formattedErrors }
}
