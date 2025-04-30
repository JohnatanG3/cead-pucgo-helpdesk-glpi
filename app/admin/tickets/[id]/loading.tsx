import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminTicketDetailLoading() {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-10 border-b bg-background">
				<div className="container flex h-16 items-center px-4 md:px-6">
					<Skeleton className="h-6 w-40" />
				</div>
			</header>

			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto">
					<div className="mb-6">
						<Skeleton className="h-8 w-3/4 mb-2" />
						<div className="flex flex-wrap items-center gap-2 mt-2">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-6 w-20" />
							<Skeleton className="h-6 w-28" />
						</div>
						<Skeleton className="h-4 w-48 mt-2" />
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						<div className="md:col-span-2 space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Descrição</CardTitle>
								</CardHeader>
								<CardContent>
									<Skeleton className="h-4 w-full mb-2" />
									<Skeleton className="h-4 w-full mb-2" />
									<Skeleton className="h-4 w-3/4" />
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Histórico de Interações</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="p-3 border rounded-lg">
										<div className="flex items-center gap-2">
											<Skeleton className="h-8 w-8 rounded-full" />
											<div>
												<Skeleton className="h-4 w-32 mb-1" />
												<Skeleton className="h-3 w-24" />
											</div>
										</div>
										<Skeleton className="h-4 w-full mt-2" />
										<Skeleton className="h-4 w-3/4 mt-1" />
									</div>
									<div className="p-3 border rounded-lg">
										<div className="flex items-center gap-2">
											<Skeleton className="h-8 w-8 rounded-full" />
											<div>
												<Skeleton className="h-4 w-32 mb-1" />
												<Skeleton className="h-3 w-24" />
											</div>
										</div>
										<Skeleton className="h-4 w-full mt-2" />
										<Skeleton className="h-4 w-3/4 mt-1" />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Responder</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<Skeleton className="h-24 w-full" />
									<Skeleton className="h-10 w-40" />
								</CardContent>
							</Card>
						</div>

						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Informações do Chamado</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex justify-between">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-8 w-32" />
									</div>
									<div className="flex justify-between">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-8 w-32" />
									</div>
									<div className="flex justify-between">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-8 w-32" />
									</div>
									<Skeleton className="h-px w-full" />
									<div>
										<Skeleton className="h-5 w-40 mb-2" />
										<div className="space-y-1">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-full" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Ações</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-px w-full" />
									<Skeleton className="h-10 w-full" />
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>

			<footer className="border-t py-4">
				<div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
					<Skeleton className="h-4 w-full md:w-3/4" />
				</div>
			</footer>
		</div>
	);
}
