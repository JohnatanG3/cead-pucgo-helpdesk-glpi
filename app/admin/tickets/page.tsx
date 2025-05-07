"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityIndicator } from "@/components/priority-indicator";
import {
	getTickets,
	mapGLPIStatusToString,
	mapGLPIPriorityToString,
} from "@/lib/glpi-api";
import { useAuth } from "@/contexts/auth-context";
import { BugIcon } from "@/components/icons/bug-icon";
import { AppHeader } from "@/components/app-header";

export default function AdminTicketsPage() {
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [tickets, setTickets] = useState<any[]>([]);
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [isLoading, setIsLoading] = useState(true);
	const [timeoutOccurred, setTimeoutOccurred] = useState(false);

	// Verificar autenticação e permissão
	useEffect(() => {
		if (!authLoading) {
			if (!user) {
				router.push("/");
			} else if (user.role !== "admin") {
				toast.error("Você não tem permissão para acessar esta página.");
				router.push("/dashboard");
			} else {
				loadTickets();
			}
		}
	}, [user, authLoading, router]);

	// Timeout para evitar carregamento infinito
	useEffect(() => {
		const timer = setTimeout(() => {
			if (isLoading) {
				console.log("Timeout ao carregar tickets");
				setTimeoutOccurred(true);
				setIsLoading(false);
			}
		}, 10000); // 10 segundos de timeout

		return () => clearTimeout(timer);
	}, [isLoading]);

	// Carregar tickets
	async function loadTickets() {
		try {
			console.log("AdminTicketsPage - Carregando tickets...");
			setIsLoading(true);

			// Usar Promise.race para adicionar um timeout
			const ticketsData = await Promise.race([
				getTickets(),
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				new Promise<any[]>((resolve) =>
					setTimeout(() => {
						console.log("Timeout ao carregar tickets, usando dados vazios");
						resolve([]);
					}, 8000),
				),
			]);

			console.log("AdminTicketsPage - Tickets carregados:", ticketsData.length);
			setTickets(Array.isArray(ticketsData) ? ticketsData : []);
			setFilteredTickets(Array.isArray(ticketsData) ? ticketsData : []);
		} catch (error) {
			console.error("AdminTicketsPage - Erro ao carregar tickets:", error);
			toast.error("Não foi possível carregar os chamados.");
			setTickets([]);
			setFilteredTickets([]);
		} finally {
			setIsLoading(false);
		}
	}

	// Filtrar tickets
	useEffect(() => {
		if (!tickets || tickets.length === 0) {
			setFilteredTickets([]);
			return;
		}

		let result = [...tickets];

		// Filtrar por status
		if (statusFilter !== "all") {
			result = result.filter(
				(ticket) => mapGLPIStatusToString(ticket.status) === statusFilter,
			);
		}

		// Filtrar por prioridade
		if (priorityFilter !== "all") {
			result = result.filter(
				(ticket) => mapGLPIPriorityToString(ticket.priority) === priorityFilter,
			);
		}

		// Filtrar por busca
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(ticket) =>
					ticket.name?.toLowerCase().includes(query) ||
					ticket.content?.toLowerCase().includes(query) ||
					ticket.id?.toString().includes(query),
			);
		}

		setFilteredTickets(result);
	}, [tickets, statusFilter, priorityFilter, searchQuery]);

	// Formatar data
	const formatDate = (dateString: string) => {
		if (!dateString) return "Data desconhecida";
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("pt-BR", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
		} catch (e) {
			return "Data inválida";
		}
	};

	const handleDebug = (ticketId: number) => {
		router.push(`/admin/tickets/debug/${ticketId}`);
	};

	if (authLoading || (isLoading && !timeoutOccurred)) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Carregando...</p>
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button
						className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
						onClick={() => {
							setIsLoading(false);
							setTimeoutOccurred(true);
						}}
					>
						Forçar carregamento
					</button>
				</div>
			</div>
		);
	}

	// Função para renderizar um item de chamado com botões
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const renderTicketItem = (ticket: any) => (
		<div
			key={ticket.id}
			className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 border-b pb-4"
		>
			<div className="flex items-start sm:items-center space-x-4">
				<PriorityIndicator priority={ticket.priority} />
				<div>
					<p className="text-sm font-medium leading-none">{ticket.name}</p>
					<p className="text-sm text-muted-foreground">
						Aberto em {formatDate(ticket.date_creation)}
					</p>
				</div>
			</div>
			<div className="flex space-x-2">
				<Link href={`/admin/tickets/${ticket.id}`}>
					<Button
						variant="default"
						size="sm"
						className="bg-cead-blue hover:bg-cead-blue/90"
					>
						Responder
					</Button>
				</Link>
				<Button
					variant="outline"
					size="sm"
					className="border-cead-blue text-cead-blue hover:bg-cead-blue/10"
					onClick={() => handleDebug(ticket.id)}
				>
					<BugIcon className="mr-2 h-4 w-4" />
					Debug
				</Button>
			</div>
		</div>
	);

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader isAdmin={true} />
			<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
				{/* Cabeçalho com título e botões - Redesenhado para melhor responsividade */}
				<div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
					<div className="flex items-center space-x-4">
						<Button variant="outline" size="icon" asChild className="shrink-0">
							<Link href="/admin">
								<ArrowLeft className="h-4 w-4" />
								<span className="sr-only">Voltar</span>
							</Link>
						</Button>
						<h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
							Chamados
						</h2>
					</div>
					<Button size="sm" asChild className="w-full sm:w-auto">
						<Link href="/admin/new-ticket">
							<Plus className="mr-2 h-4 w-4" />
							Novo Chamado
						</Link>
					</Button>
				</div>

				{/* Filtros - Redesenhados para melhor responsividade */}
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Buscar chamados..."
							className="pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger>
							<SelectValue placeholder="Filtrar por status" />
						</SelectTrigger>
						<SelectContent className="max-h-[60vh] overflow-y-auto">
							<SelectItem value="all">Todos os status</SelectItem>
							<SelectItem value="new">Novos</SelectItem>
							<SelectItem value="pending">Pendentes</SelectItem>
							<SelectItem value="in_progress">Em andamento</SelectItem>
							<SelectItem value="resolved">Resolvidos</SelectItem>
							<SelectItem value="closed">Fechados</SelectItem>
						</SelectContent>
					</Select>
					<Select value={priorityFilter} onValueChange={setPriorityFilter}>
						<SelectTrigger>
							<SelectValue placeholder="Filtrar por prioridade" />
						</SelectTrigger>
						<SelectContent className="max-h-[60vh] overflow-y-auto">
							<SelectItem value="all">Todas as prioridades</SelectItem>
							<SelectItem value="low">Baixa</SelectItem>
							<SelectItem value="medium">Média</SelectItem>
							<SelectItem value="high">Alta</SelectItem>
							<SelectItem value="urgent">Urgente</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Tabs - Redesenhadas para melhor responsividade */}
				<Tabs defaultValue="all" className="space-y-4">
					<TabsList className="w-full flex overflow-x-auto no-scrollbar">
						<TabsTrigger value="all" className="flex-1">
							Todos
						</TabsTrigger>
						<TabsTrigger value="pending" className="flex-1">
							Pendentes
						</TabsTrigger>
						<TabsTrigger value="in_progress" className="flex-1">
							Em Andamento
						</TabsTrigger>
						<TabsTrigger value="resolved" className="flex-1">
							Resolvidos
						</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Todos os Chamados</CardTitle>
								<CardDescription>
									{filteredTickets.length} chamado
									{filteredTickets.length !== 1 && "s"} encontrado
									{filteredTickets.length !== 1 && "s"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{timeoutOccurred && tickets.length === 0 ? (
										<div className="text-center py-6">
											<p className="text-amber-500 font-medium">
												Tempo limite excedido ao carregar chamados.
											</p>
											<Button
												variant="outline"
												className="mt-4"
												onClick={() => {
													setTimeoutOccurred(false);
													setIsLoading(true);
													loadTickets();
												}}
											>
												Tentar novamente
											</Button>
										</div>
									) : filteredTickets.length > 0 ? (
										<div className="space-y-4">
											{filteredTickets.map(renderTicketItem)}
										</div>
									) : (
										<div className="text-center py-6">
											<p className="text-muted-foreground">
												Nenhum chamado encontrado.
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="pending" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Chamados Pendentes</CardTitle>
								<CardDescription>
									{
										filteredTickets.filter(
											(ticket) =>
												mapGLPIStatusToString(ticket.status) === "pending",
										).length
									}{" "}
									chamado
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "pending",
									).length !== 1 && "s"}{" "}
									encontrado
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "pending",
									).length !== 1 && "s"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "pending",
									).length > 0 ? (
										filteredTickets
											.filter(
												(ticket) =>
													mapGLPIStatusToString(ticket.status) === "pending",
											)
											.map(renderTicketItem)
									) : (
										<div className="text-center py-6">
											<p className="text-muted-foreground">
												Nenhum chamado pendente encontrado.
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="in_progress" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Chamados Em Andamento</CardTitle>
								<CardDescription>
									{
										filteredTickets.filter(
											(ticket) =>
												mapGLPIStatusToString(ticket.status) === "in_progress",
										).length
									}{" "}
									chamado
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "in_progress",
									).length !== 1 && "s"}{" "}
									encontrado
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "in_progress",
									).length !== 1 && "s"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "in_progress",
									).length > 0 ? (
										filteredTickets
											.filter(
												(ticket) =>
													mapGLPIStatusToString(ticket.status) ===
													"in_progress",
											)
											.map(renderTicketItem)
									) : (
										<div className="text-center py-6">
											<p className="text-muted-foreground">
												Nenhum chamado em andamento encontrado.
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="resolved" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Chamados Resolvidos</CardTitle>
								<CardDescription>
									{
										filteredTickets.filter(
											(ticket) =>
												mapGLPIStatusToString(ticket.status) === "resolved",
										).length
									}{" "}
									chamado
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "resolved",
									).length !== 1 && "s"}{" "}
									encontrado
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "resolved",
									).length !== 1 && "s"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{filteredTickets.filter(
										(ticket) =>
											mapGLPIStatusToString(ticket.status) === "resolved",
									).length > 0 ? (
										filteredTickets
											.filter(
												(ticket) =>
													mapGLPIStatusToString(ticket.status) === "resolved",
											)
											.map(renderTicketItem)
									) : (
										<div className="text-center py-6">
											<p className="text-muted-foreground">
												Nenhum chamado resolvido encontrado.
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
