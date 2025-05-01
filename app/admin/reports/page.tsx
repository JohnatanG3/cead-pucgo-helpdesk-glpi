"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Download, LogOut, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	getTicketStats,
	getResolutionTimeReport,
	getSatisfactionReport,
	getCategories,
	type GLPICategory,
} from "@/lib/glpi-api";
import { useAuth } from "@/contexts/auth-context";

export default function ReportsPage() {
	const { user, isLoading: authLoading, logout } = useAuth();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [categories, setCategories] = useState<GLPICategory[]>([]);
	const [stats, setStats] = useState<{
		total: number;
		byStatus: Record<string, number>;
		byPriority: Record<string, number>;
		byCategory: Record<string, number>;
		byAssignedGroup: Record<string, number>;
		byAssignedUser: Record<string, number>;
	} | null>(null);
	const [resolutionTimeData, setResolutionTimeData] = useState<{
		averageResolutionTime: number;
		ticketsByResolutionTime: {
			id: number;
			name: string;
			resolutionTime: number;
		}[];
	} | null>(null);
	const [satisfactionData, setSatisfactionData] = useState<{
		averageSatisfaction: number;
		satisfactionByCategory: Record<string, number>;
		satisfactionByTechnician: Record<string, number>;
	} | null>(null);

	// Filtros para relatório de tempo de resolução
	const [resolutionFilters, setResolutionFilters] = useState({
		startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
			.toISOString()
			.split("T")[0], // 1 mês atrás
		endDate: new Date().toISOString().split("T")[0], // Hoje
		categoryId: "",
		priorityId: "",
	});

	// Verificar autenticação e permissão
	useEffect(() => {
		if (!authLoading) {
			if (!user) {
				router.push("/");
			} else if (user.role !== "admin") {
				toast.error("Você não tem permissão para acessar esta página.");
				router.push("/dashboard");
			} else {
				// Carregar dados apenas se for admin
				loadReportData();
			}
		}
	}, [user, authLoading, router]);

	// Carregar dados de relatório
	async function loadReportData() {
		try {
			setIsLoading(true);

			// Carregar categorias
			const categoriesData = await getCategories();
			setCategories(categoriesData);

			// Carregar estatísticas gerais
			const statsData = await getTicketStats();
			setStats(statsData);

			// Carregar dados de tempo de resolução
			const resolutionData = await getResolutionTimeReport({
				startDate: resolutionFilters.startDate,
				endDate: resolutionFilters.endDate,
				categoryId: resolutionFilters.categoryId
					? Number(resolutionFilters.categoryId)
					: undefined,
				priorityId: resolutionFilters.priorityId
					? Number(resolutionFilters.priorityId)
					: undefined,
			});
			setResolutionTimeData(resolutionData);

			// Carregar dados de satisfação
			const satisfactionData = await getSatisfactionReport();
			setSatisfactionData(satisfactionData);
		} catch (error) {
			console.error("Erro ao carregar dados de relatório:", error);
			toast.error("Não foi possível carregar os dados de relatório.");
		} finally {
			setIsLoading(false);
		}
	}

	// Atualizar relatório de tempo de resolução quando os filtros mudarem
	async function updateResolutionTimeReport() {
		try {
			setIsLoading(true);
			const resolutionData = await getResolutionTimeReport({
				startDate: resolutionFilters.startDate,
				endDate: resolutionFilters.endDate,
				categoryId: resolutionFilters.categoryId
					? Number(resolutionFilters.categoryId)
					: undefined,
				priorityId: resolutionFilters.priorityId
					? Number(resolutionFilters.priorityId)
					: undefined,
			});
			setResolutionTimeData(resolutionData);
		} catch (error) {
			console.error(
				"Erro ao atualizar relatório de tempo de resolução:",
				error,
			);
			toast.error("Não foi possível atualizar o relatório.");
		} finally {
			setIsLoading(false);
		}
	}

	// Função para exportar dados para CSV
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	function exportToCSV(data: any[], filename: string) {
		if (!data.length) return;

		// Obter cabeçalhos
		const headers = Object.keys(data[0]);

		// Criar conteúdo CSV
		const csvContent =
			// biome-ignore lint/style/useTemplate: <explanation>
			headers.join(",") +
			"\n" +
			data
				.map((row) => {
					return headers
						.map((header) => {
							const cell = row[header];
							// Escapar aspas e adicionar aspas se necessário
							return typeof cell === "string"
								? `"${cell.replace(/"/g, '""')}"`
								: cell;
						})
						.join(",");
				})
				.join("\n");

		// Criar blob e link para download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	if (authLoading || isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Carregando relatórios...</p>
				</div>
			</div>
		);
	}

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
						<span className="text-lg font-semibold">CEAD - PUC GO (Admin)</span>
					</div>
					<div className="flex items-center gap-4">
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
							<h1 className="text-2xl font-bold">Relatórios</h1>
							<p className="text-muted-foreground">
								Visualize estatísticas e relatórios do sistema
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="default" onClick={() => router.push("/admin")}>
								Voltar ao Dashboard
							</Button>
						</div>
					</div>

					<Tabs
						defaultValue="overview"
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="mb-4 bg-muted w-full justify-start">
							<TabsTrigger
								value="overview"
								className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
							>
								Visão Geral
							</TabsTrigger>
							<TabsTrigger
								value="resolution-time"
								className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
							>
								Tempo de Resolução
							</TabsTrigger>
							<TabsTrigger
								value="satisfaction"
								className="data-[state=active]:bg-cead-blue data-[state=active]:text-white"
							>
								Satisfação
							</TabsTrigger>
						</TabsList>

						{/* Visão Geral */}
						<TabsContent value="overview" className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">
											Total de Chamados
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{stats?.total || 0}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">
											Chamados Pendentes
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{stats?.byStatus?.pending || 0}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">
											Em Andamento
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{stats?.byStatus?.in_progress || 0}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">
											Resolvidos
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{(stats?.byStatus?.resolved || 0) +
												(stats?.byStatus?.closed || 0)}
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Chamados por Status</CardTitle>
										<CardDescription>
											Distribuição de chamados por status
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{stats &&
												Object.entries(stats.byStatus).map(
													([status, count]) => (
														<div
															key={status}
															className="flex items-center justify-between"
														>
															<div className="flex items-center gap-2">
																<div
																	className={`h-3 w-3 rounded-full ${
																		status === "new" || status === "pending"
																			? "bg-yellow-500"
																			: status === "in_progress"
																				? "bg-blue-500"
																				: "bg-green-500"
																	}`}
																/>
																<span className="capitalize">
																	{status === "new"
																		? "Novo"
																		: status === "pending"
																			? "Pendente"
																			: status === "in_progress"
																				? "Em Andamento"
																				: status === "resolved"
																					? "Resolvido"
																					: status === "closed"
																						? "Fechado"
																						: status}
																</span>
															</div>
															<span className="font-medium">{count}</span>
														</div>
													),
												)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Chamados por Prioridade</CardTitle>
										<CardDescription>
											Distribuição de chamados por prioridade
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{stats &&
												Object.entries(stats.byPriority).map(
													([priority, count]) => (
														<div
															key={priority}
															className="flex items-center justify-between"
														>
															<div className="flex items-center gap-2">
																<div
																	className={`h-3 w-3 rounded-full ${
																		priority === "low"
																			? "bg-green-500"
																			: priority === "medium"
																				? "bg-blue-500"
																				: priority === "high"
																					? "bg-orange-500"
																					: "bg-red-500"
																	}`}
																/>
																<span className="capitalize">
																	{priority === "low"
																		? "Baixa"
																		: priority === "medium"
																			? "Média"
																			: priority === "high"
																				? "Alta"
																				: priority === "urgent"
																					? "Urgente"
																					: priority === "critical"
																						? "Crítica"
																						: priority}
																</span>
															</div>
															<span className="font-medium">{count}</span>
														</div>
													),
												)}
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Chamados por Categoria</CardTitle>
										<CardDescription>
											Distribuição de chamados por categoria
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{stats &&
												Object.entries(stats.byCategory).map(
													([categoryId, count]) => {
														const category = categories.find(
															(c) => c.id.toString() === categoryId,
														);
														return (
															<div
																key={categoryId}
																className="flex items-center justify-between"
															>
																<span>
																	{category
																		? category.name
																		: `Categoria #${categoryId}`}
																</span>
																<span className="font-medium">{count}</span>
															</div>
														);
													},
												)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Chamados por Grupo</CardTitle>
										<CardDescription>
											Distribuição de chamados por grupo atribuído
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{stats &&
												Object.entries(stats.byAssignedGroup).map(
													([groupId, count]) => (
														<div
															key={groupId}
															className="flex items-center justify-between"
														>
															<span>Grupo #{groupId}</span>
															<span className="font-medium">{count}</span>
														</div>
													),
												)}
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="flex justify-end">
								<Button
									variant="outline"
									className="flex items-center gap-2"
									onClick={() => {
										if (!stats) return;

										// Preparar dados para exportação
										const exportData = [
											{
												Métrica: "Total de Chamados",
												Valor: stats.total,
											},
											...Object.entries(stats.byStatus).map(
												([status, count]) => ({
													Métrica: `Status: ${status}`,
													Valor: count,
												}),
											),
											...Object.entries(stats.byPriority).map(
												([priority, count]) => ({
													Métrica: `Prioridade: ${priority}`,
													Valor: count,
												}),
											),
											...Object.entries(stats.byCategory).map(
												([categoryId, count]) => {
													const category = categories.find(
														(c) => c.id.toString() === categoryId,
													);
													return {
														Métrica: `Categoria: ${category ? category.name : `#${categoryId}`}`,
														Valor: count,
													};
												},
											),
										];

										exportToCSV(exportData, "visao-geral-chamados.csv");
									}}
								>
									<Download className="h-4 w-4" />
									Exportar Dados
								</Button>
							</div>
						</TabsContent>

						{/* Tempo de Resolução */}
						<TabsContent value="resolution-time" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Filtros</CardTitle>
									<CardDescription>
										Selecione os filtros para o relatório de tempo de resolução
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-4">
										<div className="space-y-2">
											<Label htmlFor="startDate">Data Inicial</Label>
											<Input
												id="startDate"
												type="date"
												value={resolutionFilters.startDate}
												onChange={(e) =>
													setResolutionFilters({
														...resolutionFilters,
														startDate: e.target.value,
													})
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="endDate">Data Final</Label>
											<Input
												id="endDate"
												type="date"
												value={resolutionFilters.endDate}
												onChange={(e) =>
													setResolutionFilters({
														...resolutionFilters,
														endDate: e.target.value,
													})
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="category">Categoria</Label>
											<Select
												value={resolutionFilters.categoryId}
												onValueChange={(value) =>
													setResolutionFilters({
														...resolutionFilters,
														categoryId: value,
													})
												}
											>
												<SelectTrigger id="category">
													<SelectValue placeholder="Todas as categorias" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">
														Todas as categorias
													</SelectItem>
													{categories.map((category) => (
														<SelectItem
															key={category.id}
															value={category.id.toString()}
														>
															{category.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="priority">Prioridade</Label>
											<Select
												value={resolutionFilters.priorityId}
												onValueChange={(value) =>
													setResolutionFilters({
														...resolutionFilters,
														priorityId: value,
													})
												}
											>
												<SelectTrigger id="priority">
													<SelectValue placeholder="Todas as prioridades" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">
														Todas as prioridades
													</SelectItem>
													<SelectItem value="1">Baixa</SelectItem>
													<SelectItem value="2">Média</SelectItem>
													<SelectItem value="3">Alta</SelectItem>
													<SelectItem value="4">Urgente</SelectItem>
													<SelectItem value="5">Crítica</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="mt-4 flex justify-end">
										<Button onClick={updateResolutionTimeReport}>
											Aplicar Filtros
										</Button>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Tempo Médio de Resolução</CardTitle>
									<CardDescription>
										Tempo médio para resolução de chamados
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center">
										<div className="text-4xl font-bold">
											{resolutionTimeData
												? `${resolutionTimeData.averageResolutionTime.toFixed(1)} horas`
												: "Carregando..."}
										</div>
										<p className="text-sm text-muted-foreground mt-2">
											Tempo médio de resolução
										</p>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Detalhes por Chamado</CardTitle>
									<CardDescription>
										Tempo de resolução para cada chamado
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead>
												<tr className="border-b">
													<th className="text-left py-2 px-2">ID</th>
													<th className="text-left py-2 px-2">Título</th>
													<th className="text-left py-2 px-2">
														Tempo de Resolução (horas)
													</th>
												</tr>
											</thead>
											<tbody>
												{resolutionTimeData?.ticketsByResolutionTime.length ? (
													resolutionTimeData.ticketsByResolutionTime.map(
														(ticket) => (
															<tr key={ticket.id} className="border-b">
																<td className="py-2 px-2">#{ticket.id}</td>
																<td className="py-2 px-2">{ticket.name}</td>
																<td className="py-2 px-2">
																	{ticket.resolutionTime.toFixed(1)}
																</td>
															</tr>
														),
													)
												) : (
													<tr>
														<td
															colSpan={3}
															className="py-4 text-center text-muted-foreground"
														>
															Nenhum chamado resolvido encontrado para os
															filtros selecionados.
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>

							<div className="flex justify-end">
								<Button
									variant="outline"
									className="flex items-center gap-2"
									onClick={() => {
										if (!resolutionTimeData) return;

										// Preparar dados para exportação
										const exportData = [
											{
												"Tempo Médio de Resolução (horas)":
													resolutionTimeData.averageResolutionTime.toFixed(1),
											},
											{ "": "" }, // Linha em branco
											{
												ID: "ID",
												Título: "Título",
												"Tempo de Resolução (horas)":
													"Tempo de Resolução (horas)",
											},
											...resolutionTimeData.ticketsByResolutionTime.map(
												(ticket) => ({
													ID: ticket.id,
													Título: ticket.name,
													"Tempo de Resolução (horas)":
														ticket.resolutionTime.toFixed(1),
												}),
											),
										];

										exportToCSV(exportData, "tempo-resolucao-chamados.csv");
									}}
								>
									<Download className="h-4 w-4" />
									Exportar Dados
								</Button>
							</div>
						</TabsContent>

						{/* Satisfação */}
						<TabsContent value="satisfaction" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Satisfação Média</CardTitle>
									<CardDescription>
										Nível médio de satisfação dos usuários
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center">
										<div className="text-4xl font-bold">
											{satisfactionData
												? `${satisfactionData.averageSatisfaction.toFixed(1)}/5`
												: "Carregando..."}
										</div>
										<p className="text-sm text-muted-foreground mt-2">
											Satisfação média (escala de 1-5)
										</p>
									</div>
								</CardContent>
							</Card>

							<div className="grid gap-4 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Satisfação por Categoria</CardTitle>
										<CardDescription>
											Nível de satisfação por categoria de chamado
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{satisfactionData &&
												Object.entries(
													satisfactionData.satisfactionByCategory,
												).map(([categoryId, rating]) => {
													const category = categories.find(
														(c) => c.id.toString() === categoryId,
													);
													return (
														<div
															key={categoryId}
															className="flex items-center justify-between"
														>
															<span>
																{category
																	? category.name
																	: `Categoria #${categoryId}`}
															</span>
															<span className="font-medium">
																{rating.toFixed(1)}/5
															</span>
														</div>
													);
												})}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Satisfação por Técnico</CardTitle>
										<CardDescription>
											Nível de satisfação por técnico responsável
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{satisfactionData &&
												Object.entries(
													satisfactionData.satisfactionByTechnician,
												).map(([technicianId, rating]) => (
													<div
														key={technicianId}
														className="flex items-center justify-between"
													>
														<span>Técnico #{technicianId}</span>
														<span className="font-medium">
															{rating.toFixed(1)}/5
														</span>
													</div>
												))}
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="flex justify-end">
								<Button
									variant="outline"
									className="flex items-center gap-2"
									onClick={() => {
										if (!satisfactionData) return;

										// Preparar dados para exportação
										const exportData = [
											{
												"Satisfação Média": `${satisfactionData.averageSatisfaction.toFixed(1)}/5`,
											},
											{ "": "" }, // Linha em branco
											{
												Categoria: "Categoria",
												"Nível de Satisfação": "Nível de Satisfação",
											},
											...Object.entries(
												satisfactionData.satisfactionByCategory,
											).map(([categoryId, rating]) => {
												const category = categories.find(
													(c) => c.id.toString() === categoryId,
												);
												return {
													Categoria: category
														? category.name
														: `Categoria #${categoryId}`,
													"Nível de Satisfação": `${rating.toFixed(1)}/5`,
												};
											}),
											{ "": "" }, // Linha em branco
											{
												Técnico: "Técnico",
												"Nível de Satisfação": "Nível de Satisfação",
											},
											...Object.entries(
												satisfactionData.satisfactionByTechnician,
											).map(([technicianId, rating]) => ({
												Técnico: `Técnico #${technicianId}`,
												"Nível de Satisfação": `${rating.toFixed(1)}/5`,
											})),
										];

										exportToCSV(exportData, "satisfacao-usuarios.csv");
									}}
								>
									<Download className="h-4 w-4" />
									Exportar Dados
								</Button>
							</div>
						</TabsContent>
					</Tabs>
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
