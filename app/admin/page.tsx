"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Bell,
	ChevronDown,
	LogOut,
	Search,
	User,
	Filter,
	Plus,
	FileText,
	BarChart3,
	Layers,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	getTickets,
	mapGLPIStatusToString,
	type GLPITicket,
} from "@/lib/glpi-api";
import { useAuth } from "@/contexts/auth-context";
import { PriorityIndicator } from "@/components/priority-indicator";

export default function AdminDashboard() {
	const { user, isLoading: authLoading, logout } = useAuth();
	const router = useRouter();

	const [tickets, setTickets] = useState<GLPITicket[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	// Estatísticas simuladas (em um sistema real, seriam obtidas da API)
	const stats = [
		{ title: "Total de Chamados", value: 0, change: "Carregando..." },
		{ title: "Pendentes", value: 0, change: "Carregando..." },
		{ title: "Em Andamento", value: 0, change: "Carregando..." },
		{ title: "Resolvidos (Mês)", value: 0, change: "Carregando..." },
	];

	// Verificar autenticação e permissão - Simplificado para evitar loops
	useEffect(() => {
		// Verificação simplificada para evitar loops
		if (!authLoading) {
			if (!user) {
				console.log("Usuário não autenticado, redirecionando para login");
				router.push("/");
				return;
			}

			if (user.role !== "admin") {
				console.log("Usuário não é admin, redirecionando para dashboard");
				toast.error("Você não tem permissão para acessar esta página.");
				router.push("/dashboard");
				return;
			}

			// Se chegou aqui, o usuário é admin e está autenticado
			loadTickets();
		}
	}, [user, authLoading, router]);

	// Carregar tickets - Simplificado com tratamento de erros melhorado
	async function loadTickets() {
		try {
			console.log("Carregando tickets...");

			// Adicionando um timeout para garantir que não fique em loop infinito
			const ticketsData = await Promise.race([
				getTickets({
					sort: "date_creation",
					order: "DESC",
					limit: "10",
				}),
				// Timeout de 5 segundos para evitar espera infinita
				new Promise<GLPITicket[]>((resolve) =>
					setTimeout(() => {
						console.log("Timeout ao carregar tickets, usando dados vazios");
						resolve([]);
					}, 5000),
				),
			]);

			console.log("Tickets carregados:", ticketsData.length);
			setTickets(Array.isArray(ticketsData) ? ticketsData : []);
		} catch (error) {
			console.error("Erro ao carregar tickets:", error);
			toast.error("Não foi possível carregar os chamados.");
			// Definir tickets como array vazio em caso de erro
			setTickets([]);
		} finally {
			// Sempre definir isLoading como false, mesmo em caso de erro
			setIsLoading(false);
		}
	}

	// Filtrar tickets com base na busca
	const filteredTickets = tickets.filter(
		(ticket) =>
			ticket.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticket.id?.toString().includes(searchQuery),
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
		if (!dateString) return "Data desconhecida";
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("pt-BR");
		} catch (e) {
			return "Data inválida";
		}
	};

	// Mostrar tela de carregamento apenas por um tempo limitado
	useEffect(() => {
		// Se ainda estiver carregando após 10 segundos, forçar a renderização da página
		const timer = setTimeout(() => {
			if (isLoading) {
				console.log("Forçando renderização após timeout");
				setIsLoading(false);
			}
		}, 10000);

		return () => clearTimeout(timer);
	}, [isLoading]);

	// Calcular estatísticas com base nos tickets carregados
	const calculateStats = () => {
		const total = tickets.length;
		const pending = tickets.filter(
			(t) => t.status === 1 || t.status === 2,
		).length;
		const inProgress = tickets.filter((t) => t.status === 3).length;
		const resolved = tickets.filter(
			(t) => t.status === 4 || t.status === 5,
		).length;

		return [
			{
				title: "Total de Chamados",
				value: total,
				change: `${total} chamados no sistema`,
			},
			{
				title: "Pendentes",
				value: pending,
				change: `${pending} aguardando atendimento`,
			},
			{
				title: "Em Andamento",
				value: inProgress,
				change: `${inProgress} em processamento`,
			},
			{ title: "Resolvidos (Mês)", value: resolved, change: "Satisfação: N/A" },
		];
	};

	const currentStats = isLoading ? stats : calculateStats();

	// Se estiver carregando por muito tempo, mostrar uma mensagem de erro
	if (authLoading && isLoading) {
		return (
			<div className="flex min-h-screen flex-col">
				<header className="sticky top-0 z-10 border-b bg-cead-blue text-white">
					<div className="container flex h-16 items-center justify-between px-4 md:px-6">
						<div className="flex items-center gap-2">
							<img
								src="/puc-goias.svg"
								alt="Logo CEAD PUC GO"
								className="h-8 w-8"
							/>
							<span className="text-lg font-semibold">
								CEAD - PUC GO (Admin)
							</span>
						</div>
					</div>
				</header>

				<div className="flex flex-1 items-center justify-center">
					<div className="text-center">
						{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
						<p className="mt-4 text-muted-foreground">Carregando...</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => {
								setIsLoading(false);
								toast.info("Forçando carregamento da página");
							}}
						>
							Forçar carregamento
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-10 border-b bg-cead-blue text-white">
				<div className="container flex h-16 items-center justify-between px-4 md:px-6">
					<div className="flex items-center gap-2">
						<img src="/puc-goias.svg" alt="Logo CEAD PUC GO" className="h-8 w-8" />
						<span className="text-lg font-semibold">CEAD - PUC GO (Admin)</span>
					</div>
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/10"
						>
							<Bell className="h-5 w-5" />
							<span className="sr-only">Notificações</span>
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex items-center gap-2 text-white hover:bg-white/10"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src="/placeholder.svg?height=32&width=32"
											alt="Avatar"
										/>
										<AvatarFallback>AD</AvatarFallback>
									</Avatar>
									<span className="hidden md:inline-flex">
										{user?.name || "Administrador"}
									</span>
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<User className="mr-2 h-4 w-4" />
									Perfil
								</DropdownMenuItem>
								<DropdownMenuItem onClick={logout}>
									<LogOut className="mr-2 h-4 w-4" />
									Sair
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto grid gap-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-2xl font-bold">Painel Administrativo</h1>
							<p className="text-muted-foreground">
								Gerencie os chamados e acompanhe as métricas do sistema.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Link href="/admin/categories">
								<Button variant="default">
									<Layers className="mr-2 h-4 w-4" />
									Gerenciar Categorias
								</Button>
							</Link>
							<Link href="/admin/new-ticket">
								<Button variant="default">
									<Plus className="mr-2 h-4 w-4" />
									Abrir Chamado
								</Button>
							</Link>
							<Link href="/admin/reports">
								<Button variant="default">
									<BarChart3 className="mr-2 h-4 w-4" />
									Relatórios
								</Button>
							</Link>
							<Link href="/admin/tickets">
								<Button variant="default">
									<FileText className="mr-2 h-4 w-4" />
									Ver Todos os Chamados
								</Button>
							</Link>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{currentStats.map((stat, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<Card key={index}>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">
										{stat.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stat.value}</div>
									<p className="text-xs text-muted-foreground">{stat.change}</p>
								</CardContent>
							</Card>
						))}
					</div>

					<Card>
						<CardHeader className="pb-3">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								<div>
									<CardTitle>Chamados Recentes</CardTitle>
									<CardDescription>
										Gerencie os chamados abertos pelos coordenadores
									</CardDescription>
								</div>
								<div className="flex flex-col sm:flex-row gap-2">
									<div className="relative">
										<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											type="search"
											placeholder="Buscar chamados..."
											className="pl-8 w-full md:w-[250px]"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="default" className="flex gap-2">
												<Filter className="h-4 w-4" />
												Filtrar
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-[200px]">
											<DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<div className="p-2">
												<p className="text-sm font-medium mb-2">Status</p>
												<div className="space-y-1">
													<div className="flex items-center">
														<input
															type="checkbox"
															id="status-pending"
															className="mr-2"
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
														/>
														<label
															htmlFor="status-progress"
															className="text-sm"
														>
															Em andamento
														</label>
													</div>
													<div className="flex items-center">
														<input
															type="checkbox"
															id="status-resolved"
															className="mr-2"
														/>
														<label
															htmlFor="status-resolved"
															className="text-sm"
														>
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
														/>
														<label
															htmlFor="priority-medium"
															className="text-sm"
														>
															Média
														</label>
													</div>
													<div className="flex items-center">
														<input
															type="checkbox"
															id="priority-high"
															className="mr-2"
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
														/>
														<label
															htmlFor="priority-urgent"
															className="text-sm"
														>
															Urgente
														</label>
													</div>
												</div>
											</div>
											<DropdownMenuSeparator />
											<div className="p-2">
												<Button size="sm" className="w-full">
													Aplicar Filtros
												</Button>
											</div>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="all" className="w-full">
								<TabsList className="mb-4 bg-muted w-full justify-start">
									<TabsTrigger
										value="all"
										className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
									>
										Todos
									</TabsTrigger>
									<TabsTrigger
										value="pending"
										className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
									>
										Pendentes
									</TabsTrigger>
									<TabsTrigger
										value="in_progress"
										className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
									>
										Em Andamento
									</TabsTrigger>
									<TabsTrigger
										value="resolved"
										className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
									>
										Resolvidos
									</TabsTrigger>
								</TabsList>
								<TabsContent value="all" className="space-y-4">
									<div className="overflow-x-auto">
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
												{filteredTickets.length > 0 ? (
													filteredTickets.map((ticket) => (
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
																<PriorityIndicator priority={ticket.priority} />
															</td>
															<td className="py-2 px-2">
																{getStatusBadge(ticket.status)}
															</td>
															<td className="py-2 px-2">
																{formatDate(ticket.date_creation)}
															</td>
															<td className="py-2 px-2">
																<Link href={`/admin/tickets/${ticket.id}`}>
																	<Button variant="default" size="sm">
																		Responder
																	</Button>
																</Link>
															</td>
														</tr>
													))
												) : (
													<tr>
														<td
															colSpan={8}
															className="py-4 text-center text-muted-foreground"
														>
															{isLoading
																? "Carregando chamados..."
																: "Nenhum chamado encontrado."}
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</TabsContent>
								<TabsContent value="pending">
									{/* Conteúdo similar para chamados pendentes */}
									<p className="text-center text-muted-foreground py-4">
										Selecione a aba "Todos" para ver todos os chamados.
									</p>
								</TabsContent>
								<TabsContent value="in_progress">
									{/* Conteúdo similar para chamados em andamento */}
									<p className="text-center text-muted-foreground py-4">
										Selecione a aba "Todos" para ver todos os chamados.
									</p>
								</TabsContent>
								<TabsContent value="resolved">
									{/* Conteúdo similar para chamados resolvidos */}
									<p className="text-center text-muted-foreground py-4">
										Selecione a aba "Todos" para ver todos os chamados.
									</p>
								</TabsContent>
							</Tabs>
						</CardContent>
						<CardFooter>
							<div className="flex items-center justify-between w-full">
								<div className="text-sm text-muted-foreground">
									Mostrando {filteredTickets.length} de {tickets.length}{" "}
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
