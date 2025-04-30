// Componente Servidor
import { Suspense } from "react"
import TicketDetailContent from "./ticket-detail-content"

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }
    >
      <TicketDetailContent ticketId={params.id} />
    </Suspense>
  )
}
