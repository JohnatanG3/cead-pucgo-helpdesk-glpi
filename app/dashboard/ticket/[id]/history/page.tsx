import { Suspense } from "react"
import { notFound } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { TicketHistory } from "@/components/ticket-history"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TicketHistoryPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    return notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <Link href={`/dashboard/ticket/${params.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o chamado
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mt-2">Histórico Completo do Chamado #{params.id}</h1>
          <p className="text-muted-foreground">Visualize todas as alterações e eventos relacionados a este chamado.</p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando histórico completo...</p>
              </div>
            </div>
          }
        >
          <TicketHistory ticketId={params.id} showFullHistory={true} />
        </Suspense>
      </main>
    </div>
  )
}
