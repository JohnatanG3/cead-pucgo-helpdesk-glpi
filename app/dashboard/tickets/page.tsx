"use client";

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	getTicketsByGroup,
	getTicketsRequestedByUser,
	mapGLPIStatusToString,
	type GLPITicket,
} from "@/lib/glpi-api";
import { useAuth } from "@/contexts/auth-context";
import { PriorityIndicator } from "@/components/priority-indicator";
import { FilterDropdown } from "@/components/filter-dropdown";
import { AppHeader } from "@/components/app-header";

export default function TicketsPage() {
	const { user, isLoading: authLoading, logout } = useAuth();
	const router = useRouter();

	const [tickets, setTickets] = useState<GLPITicket[]>([]);
	const [groupTickets, setGroupTickets] = useState<GLPITicket[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("my-tickets");

	// Estados para filtros
	const [statusFilters, setStatusFilters] = useState({
		pending: false,
		in_progress: false,
		resolved: false,
	});

	const [priorityFilters, setPriorityFilters] = useState({
		low: false,
		medium: false,
		high: false,
		urgent: false,
	});

	// Verificar autenticação
	useEffect(() => {
		if (!authLoading) {
			if (!user) {
				router.push("/");
				return;
			}

			// Carregar dados se estiver autenticado
			loadTickets();
		}
	}, [user, authLoading, router]);

	// Carregar tickets
	async function loadTickets() {
		try {
			setIsLoading(true);

			// Carregar tickets do usuário
			const userTickets = await getTicketsRequestedByUser(
				user?.id ? Number.parseInt(user.id) : 1,
				{
					sort: "date_creation",
					order: "DESC",
				},
			);
			setTickets(userTickets);

			// Carregar tickets do grupo (se o usuário pertencer a um grupo)
			if (user?.group_id) {
				const ticketsFromGroup = await getTicketsByGroup(
					Number.parseInt(user.group_id),
					{
						sort: "date_creation",
						order: "DESC",
					},
				);
				setGroupTickets(ticketsFromGroup);
			}
		} catch (error) {
			console.error("Erro ao carregar tickets:", error);
			toast.error("Não foi possível carregar os chamados.");
		} finally {
			setIsLoading(false);
		}
	}

	// Aplicar filtros
	const applyFilters = () => {
		toast.success("Filtros aplicados com sucesso!");
		// Aqui você implementaria a lógica real de filtragem
	};

	// Filtrar tickets com base na busca
	const filteredTickets = tickets.filter(
		(ticket) =>
			ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticket.id.toString().includes(searchQuery),
	);

	const filteredGroupTickets = groupTickets.filter(
		(ticket) =>
			ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticket.id.toString().includes(searchQuery),
	);

	// Função para mapear status do GLPI para componente Badge
	const getStatusBadge = (status: number) => {
		const statusString = mapGLPIStatusToString(status);

		switch (statusString) {
			case "new":
			case "pending":
				return <span className="status-badge status-pending">Pendente</span>;
			case "in_progress":
				return (
					<span className="status-badge status-in-progress">Em andamento</span>
				);
			case "resolved":
			case "closed":
				return <span className="status-badge status-completed">Concluído</span>;
			default:
				return <span className="status-badge status-pending">Pendente</span>;
		}
	};

	// Função para formatar a data
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR");
	};

	// Função para criar novo chamado
	const handleNewTicket = () => {
		router.push("/dashboard/new-ticket");
	};

	// Renderizar cards para visualização mobile
	const renderTicketCard = (ticket: GLPITicket) => (
		<div key={ticket.id} className="mb-4 rounded-lg border p-4 shadow-sm">
			<div className="flex justify-between">
				<span className="font-medium">#{ticket.id}</span>
				{getStatusBadge(ticket.status)}
			</div>
			<h3 className="mt-2 font-semibold">{ticket.name}</h3>
			<div className="mt-2 grid grid-cols-2 gap-2 text-sm">
				<div>
					<span className="text-muted-foreground">Categoria:</span>
					<div>#{ticket.itilcategories_id}</div>
				</div>
				<div>
					<span className="text-muted-foreground">Prioridade:</span>
					<div className="flex items-center">
						<PriorityIndicator priority={ticket.priority} />
					</div>
				</div>
				<div>
					<span className="text-muted-foreground">Data:</span>
					<div>{formatDate(ticket.date_creation)}</div>
				</div>
			</div>
			<div className="mt-4">
				<Button
					variant="default"
					size="sm"
					className="w-full"
					onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
				>
					Ver Detalhes
				</Button>
			</div>
		</div>
	);

	// Renderizar cards para visualização mobile (tickets do grupo)
	const renderGroupTicketCard = (ticket: GLPITicket) => (
		<div key={ticket.id} className="mb-4 rounded-lg border p-4 shadow-sm">
			<div className="flex justify-between">
				<span className="font-medium">#{ticket.id}</span>
				{getStatusBadge(ticket.status)}
			</div>
			<h3 className="mt-2 font-semibold">{ticket.name}</h3>
			<div className="mt-2 grid grid-cols-2 gap-2 text-sm">
				<div>
					<span className="text-muted-foreground">Solicitante:</span>
					<div>#{ticket.users_id_recipient}</div>
				</div>
				<div>
					<span className="text-muted-foreground">Categoria:</span>
					<div>#{ticket.itilcategories_id}</div>
				</div>
				<div>
					<span className="text-muted-foreground">Prioridade:</span>
					<div className="flex items-center">
						<PriorityIndicator priority={ticket.priority} />
					</div>
				</div>
				<div>
					<span className="text-muted-foreground">Data:</span>
					<div>{formatDate(ticket.date_creation)}</div>
				</div>
			</div>
			<div className="mt-4">
				<Button
					variant="default"
					size="sm"
					className="w-full"
					onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
				>
					Ver Detalhes
				</Button>
			</div>
		</div>
	);

	if (authLoading || isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Carregando chamados...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader />

			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto grid gap-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-2xl font-bold">Meus Chamados</h1>
							<p className="text-muted-foreground">
								Visualize e acompanhe todos os seus chamados
							</p>
						</div>
						<div className="flex flex-col sm:flex-row items-center gap-2">
							<div className="relative w-full md:w-64">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Buscar chamados..."
									className="w-full pl-8"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<Button
								variant="default"
								onClick={() => router.push("/dashboard")}
								className="w-full sm:w-auto"
							>
								Voltar ao Dashboard
							</Button>
							<Button
								variant="default"
								onClick={handleNewTicket}
								className="w-full sm:w-auto bg-cead-blue hover:bg-cead-blue/90"
							>
								<Plus className="mr-2 h-4 w-4" />
								Novo Chamado
							</Button>
						</div>
					</div>

					<Card>
						<CardHeader className="pb-3">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								<div>
									<CardTitle>Lista de Chamados</CardTitle>
									<CardDescription>
										Acompanhe o status de todos os seus chamados
									</CardDescription>
								</div>
								<div className="flex flex-col sm:flex-row gap-2">
									<FilterDropdown>
										<div className="p-4">
											<p className="text-sm font-medium mb-2">Status</p>
											<div className="space-y-1">
												<div className="flex items-center">
													<input
														type="checkbox"
														id="status-pending"
														className="mr-2"
														checked={statusFilters.pending}
														onChange={(e) =>
															setStatusFilters({
																...statusFilters,
																pending: e.target.checked,
															})
														}
													/>
													<label htmlFor="status-pending" className="text-sm">
														Pendente
													</label>
												</div>
												<div className="flex items-center">
													<input
														type="checkbox"
														id="status-progress"
														className="mr-2"
														checked={statusFilters.in_progress}
														onChange={(e) =>
															setStatusFilters({
																...statusFilters,
																in_progress: e.target.checked,
															})
														}
													/>
													<label htmlFor="status-progress" className="text-sm">
														Em andamento
													</label>
												</div>
												<div className="flex items-center">
													<input
														type="checkbox"
														id="status-resolved"
														className="mr-2"
														checked={statusFilters.resolved}
														onChange={(e) =>
															setStatusFilters({
																...statusFilters,
																resolved: e.target.checked,
															})
														}
													/>
													<label htmlFor="status-resolved" className="text-sm">
														Resolvido
													</label>
												</div>
											</div>

											<p className="text-sm font-medium mb-2 mt-4">
												Prioridade
											</p>
											<div className="space-y-1">
												<div className="flex items-center">
													<input
														type="checkbox"
														id="priority-low"
														className="mr-2"
														checked={priorityFilters.low}
														onChange={(e) =>
															setPriorityFilters({
																...priorityFilters,
																low: e.target.checked,
															})
														}
													/>
													<label htmlFor="priority-low" className="text-sm">
														Baixa
													</label>
												</div>
												<div className="flex items-center">
													<input
														type="checkbox"
														id="priority-medium"
														className="mr-2"
														checked={priorityFilters.medium}
														onChange={(e) =>
															setPriorityFilters({
																...priorityFilters,
																medium: e.target.checked,
															})
														}
													/>
													<label htmlFor="priority-medium" className="text-sm">
														Média
													</label>
												</div>
												<div className="flex items-center">
													<input
														type="checkbox"
														id="priority-high"
														className="mr-2"
														checked={priorityFilters.high}
														onChange={(e) =>
															setPriorityFilters({
																...priorityFilters,
																high: e.target.checked,
															})
														}
													/>
													<label htmlFor="priority-high" className="text-sm">
														Alta
													</label>
												</div>
												<div className="flex items-center">
													<input
														type="checkbox"
														id="priority-urgent"
														className="mr-2"
														checked={priorityFilters.urgent}
														onChange={(e) =>
															setPriorityFilters({
																...priorityFilters,
																urgent: e.target.checked,
															})
														}
													/>
													<label htmlFor="priority-urgent" className="text-sm">
														Urgente
													</label>
												</div>
											</div>
										</div>
										<DropdownMenuSeparator />
										<div className="p-2">
											<Button
												size="sm"
												className="w-full"
												onClick={applyFilters}
											>
												Aplicar Filtros
											</Button>
										</div>
									</FilterDropdown>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Tabs
								defaultValue="my-tickets"
								value={activeTab}
								onValueChange={setActiveTab}
								className="w-full"
							>
								<TabsList className="mb-4 bg-muted w-full justify-start">
									<TabsTrigger
										value="my-tickets"
										className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
									>
										Meus Chamados
									</TabsTrigger>
									{user?.group_id && (
										<TabsTrigger
											value="group-tickets"
											className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
										>
											Chamados do Grupo
										</TabsTrigger>
									)}
								</TabsList>
								<TabsContent value="my-tickets" className="space-y-4">
									{/* Visualização para desktop */}
									<div className="hidden md:block overflow-x-auto">
										<table className="w-full">
											<thead>
												<tr className="border-b">
													<th className="text-left py-2 px-2">ID</th>
													<th className="text-left py-2 px-2">Título</th>
													<th className="text-left py-2 px-2">Categoria</th>
													<th className="text-left py-2 px-2">Prioridade</th>
													<th className="text-left py-2 px-2">Status</th>
													<th className="text-left py-2 px-2">Data</th>
													<th className="text-left py-2 px-2">Ações</th>
												</tr>
											</thead>
											<tbody>
												{filteredTickets.length > 0 ? (
													filteredTickets.map((ticket) => (
														<tr key={ticket.id} className="border-b">
															<td className="py-2 px-2">#{ticket.id}</td>
															<td className="py-2 px-2">{ticket.name}</td>
															<td className="py-2 px-2">
																Categoria #{ticket.itilcategories_id}
															</td>
															<td className="py-2 px-2">
																<PriorityIndicator priority={ticket.priority} />
															</td>
															<td className="py-2 px-2">
																{getStatusBadge(ticket.status)}
															</td>
															<td className="py-2 px-2">
																{formatDate(ticket.date_creation)}
															</td>
															<td className="py-2 px-2">
																<Button
																	variant="default"
																	size="sm"
																	onClick={() =>
																		router.push(
																			`/dashboard/ticket/${ticket.id}`,
																		)
																	}
																>
																	Ver Detalhes
																</Button>
															</td>
														</tr>
													))
												) : (
													<tr>
														<td
															colSpan={7}
															className="py-4 text-center text-muted-foreground"
														>
															Nenhum chamado encontrado.
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>

									{/* Visualização para mobile */}
									<div className="md:hidden">
										{filteredTickets.length > 0 ? (
											filteredTickets.map((ticket) => renderTicketCard(ticket))
										) : (
											<div className="py-4 text-center text-muted-foreground">
												Nenhum chamado encontrado.
											</div>
										)}
									</div>
								</TabsContent>
								{user?.group_id && (
									<TabsContent value="group-tickets" className="space-y-4">
										{/* Visualização para desktop */}
										<div className="hidden md:block overflow-x-auto">
											<table className="w-full">
												<thead>
													<tr className="border-b">
														<th className="text-left py-2 px-2">ID</th>
														<th className="text-left py-2 px-2">Título</th>
														<th className="text-left py-2 px-2">Solicitante</th>
														<th className="text-left py-2 px-2">Categoria</th>
														<th className="text-left py-2 px-2">Prioridade</th>
														<th className="text-left py-2 px-2">Status</th>
														<th className="text-left py-2 px-2">Data</th>
														<th className="text-left py-2 px-2">Ações</th>
													</tr>
												</thead>
												<tbody>
													{filteredGroupTickets.length > 0 ? (
														filteredGroupTickets.map((ticket) => (
															<tr key={ticket.id} className="border-b">
																<td className="py-2 px-2">#{ticket.id}</td>
																<td className="py-2 px-2">{ticket.name}</td>
																<td className="py-2 px-2">
																	Usuário #{ticket.users_id_recipient}
																</td>
																<td className="py-2 px-2">
																	Categoria #{ticket.itilcategories_id}
																</td>
																<td className="py-2 px-2">
																	<PriorityIndicator
																		priority={ticket.priority}
																	/>
																</td>
																<td className="py-2 px-2">
																	{getStatusBadge(ticket.status)}
																</td>
																<td className="py-2 px-2">
																	{formatDate(ticket.date_creation)}
																</td>
																<td className="py-2 px-2">
																	<Button
																		variant="default"
																		size="sm"
																		onClick={() =>
																			router.push(
																				`/dashboard/ticket/${ticket.id}`,
																			)
																		}
																	>
																		Ver Detalhes
																	</Button>
																</td>
															</tr>
														))
													) : (
														<tr>
															<td
																colSpan={8}
																className="py-4 text-center text-muted-foreground"
															>
																Nenhum chamado do grupo encontrado.
															</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>

										{/* Visualização para mobile */}
										<div className="md:hidden">
											{filteredGroupTickets.length > 0 ? (
												filteredGroupTickets.map((ticket) =>
													renderGroupTicketCard(ticket),
												)
											) : (
												<div className="py-4 text-center text-muted-foreground">
													Nenhum chamado do grupo encontrado.
												</div>
											)}
										</div>
									</TabsContent>
								)}
							</Tabs>
						</CardContent>
						<CardFooter>
							<div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
								<div className="text-sm text-muted-foreground">
									Mostrando{" "}
									{activeTab === "my-tickets"
										? filteredTickets.length
										: filteredGroupTickets.length}{" "}
									resultados
								</div>
								<div className="flex gap-1">
									<Button variant="default" size="sm">
										Anterior
									</Button>
									<Button variant="default" size="sm">
										Próximo
									</Button>
								</div>
							</div>
						</CardFooter>
					</Card>
				</div>
			</main>

			<footer className="border-t py-4">
				<div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
					<p className="text-center text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} CEAD - Coordenação de Educação a
						Distância - PUC GO. Todos os direitos reservados.
					</p>
					<div className="flex items-center gap-4">
						<a
							href="/termo-de-uso"
							className="text-sm text-muted-foreground hover:underline"
						>
							Termos de Uso
						</a>
						<a
							href="/politica-de-privacidade"
							className="text-sm text-muted-foreground hover:underline"
						>
							Política de Privacidade
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
