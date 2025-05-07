// Componente Servidor
import { Suspense } from "react";
import TicketDetailContent from "./ticket-detail-content";
import { AppHeader } from "@/components/app-header";

export default function TicketDetailPage({
	params,
}: { params: { id: string } }) {
	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader />
			<main className="flex-1 p-4 md:p-6">
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
			</main>
		</div>
	);
}
