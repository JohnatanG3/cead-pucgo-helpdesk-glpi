import { Suspense } from "react"
import { notFound } from "next/navigation"

import { AdminTicketDetailContent } from "./admin-ticket-detail-content"
import { getTicketById } from "@/lib/glpi-api"

export default async function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
    if (isNaN(ticketId)) {
      return notFound()
    }

    const ticket = await getTicketById(ticketId)
    if (!ticket) {
      return notFound()
    }

    return (
      <Suspense fallback={<div>Carregando...</div>}>
        <AdminTicketDetailContent ticket={ticket} />
      </Suspense>
    )
  } catch (error) {
    console.error("Erro ao carregar detalhes do chamado:", error)
    return notFound()
  }
}
