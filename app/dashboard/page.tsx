"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Plus, Search, User } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	getTickets,
	getCategories,
	createTicket,
	uploadDocument,
	linkDocumentToTicket,
	mapGLPIStatusToString,
	type GLPITicket,
	type GLPICategory,
} from "@/lib/glpi-api";
import { NotificationBell } from "@/components/notification-bell";
import { TicketSkeleton } from "@/components/dashboard/ticket-skeleton";
import { useAuth } from "@/contexts/auth-context";
import { PriorityIndicator } from "@/components/priority-indicator";
import { FileAttachment } from "@/components/file-attachment";
import { RichTextEditor } from "@/components/rich-text-editor";

export default function DashboardPage() {
	const { user, isLoading: authLoading, logout } = useAuth();
	const router = useRouter();

	const [tickets, setTickets] = useState<GLPITicket[]>([]);
	const [categories, setCategories] = useState<GLPICategory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Form state
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [priority, setPriority] = useState("");
	const [description, setDescription] = useState("");
	const [file, setFile] = useState<File | null>(null);

	// Verificar autenticação
	useEffect(() => {
		if (!authLoading) {
			if (!user) {
				router.push("/");
				return;
			}

			// Carregar dados se estiver autenticado
			loadData();
		}
	}, [user, authLoading, router]);

	// Função para carregar dados
	async function loadData() {
		try {
			const [ticketsData, categoriesData] = await Promise.all([
				getTickets({ sort: "date_creation", order: "DESC", limit: "3" }),
				getCategories(),
			]);

			setTickets(ticketsData);
			setCategories(categoriesData);
		} catch (error) {
			console.error("Erro ao carregar dados:", error);
			toast.error("Não foi possível carregar os chamados e categorias.");
		} finally {
			setIsLoading(false);
		}
	}

	const handleSubmitTicket = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Mapear os valores para o formato do GLPI
			const newTicket: Partial<GLPITicket> = {
				name: title,
				content: description,
				itilcategories_id: Number.parseInt(category),
				priority: Number.parseInt(priority),
				// Outros campos necessários para o GLPI
				status: 1, // Novo
				type: 1, // Incidente
			};

			const result = await createTicket(newTicket);
			const ticketId = result.id;

			// Se tiver arquivo, fazer upload e vincular ao ticket
			if (file) {
				try {
					// Upload do documento
					const document = await uploadDocument(file, 1); // 1 é o ID do usuário atual (simulado)

					// Vincular documento ao ticket
					await linkDocumentToTicket(document.id, ticketId);

					toast.success("Arquivo anexado com sucesso!");
				} catch (uploadError) {
					console.error("Erro ao fazer upload do arquivo:", uploadError);
					toast.error(
						"Não foi possível anexar o arquivo, mas o chamado foi criado.",
					);
				}
			}

			toast.success(
				`Seu chamado #${ticketId} foi criado e será atendido em breve.`,
			);

			// Limpar formulário
			setTitle("");
			setCategory("");
			setPriority("");
			setDescription("");
			setFile(null);

			// Recarregar tickets
			const updatedTickets = await getTickets({
				sort: "date_creation",
				order: "DESC",
				limit: "3",
			});
			setTickets(updatedTickets);
		} catch (error) {
			console.error("Erro ao criar chamado:", error);
			toast.error(
				"Não foi possível criar o chamado. Tente novamente mais tarde.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// biome-ignore lint/complexity/useOptionalChain: <explanation>
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const handleRemoveFile = () => {
		setFile(null);
		// Resetar o input de arquivo
		const fileInput = document.getElementById("attachment") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	// Função para formatar a data
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR");
	};

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

	// Se estiver carregando, mostra o esqueleto
	if (authLoading || isLoading) {
		return (
			<div className="flex min-h-screen flex-col">
				<header className="sticky top-0 z-10 border-b bg-cead-blue text-white">
					<div className="container flex h-16 items-center justify-between px-4 md:px-6">
						<div className="flex items-center gap-2">
							{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
							<div className="h-8 w-8 bg-white/20 rounded-md animate-pulse"></div>
							{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
							<div className="h-6 w-32 bg-white/20 rounded-md animate-pulse"></div>
						</div>
						<div className="flex items-center gap-4">
							{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
							<div className="h-10 w-10 bg-white/20 rounded-full animate-pulse"></div>
						</div>
					</div>
				</header>
				<main className="flex-1 p-4 md:p-6">
					<div className="container mx-auto grid gap-6">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
								<div className="h-8 w-48 bg-muted rounded-md animate-pulse"></div>
								{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
								<div className="h-4 w-64 bg-muted rounded-md animate-pulse mt-2"></div>
							</div>
							<div className="flex items-center gap-2">
								{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
								<div className="h-10 w-64 bg-muted rounded-md animate-pulse"></div>
								{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
								<div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
							</div>
						</div>
						{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
						<div className="h-px w-full bg-muted"></div>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							<TicketSkeleton />
							<TicketSkeleton />
							<TicketSkeleton />
						</div>
					</div>
				</main>
			</div>
		);
	}

	// Renderiza o conteúdo real quando estiver carregado
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
						<span className="text-lg font-semibold">CEAD - PUC GO</span>
					</div>
					<div className="flex items-center gap-4">
						<NotificationBell />
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
										<AvatarFallback>
											{user?.name?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
									<span className="hidden md:inline-flex">
										{user?.name || "Usuário"}
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
							<h1 className="text-2xl font-bold">Sistema de Chamados</h1>
							<p className="text-muted-foreground">
								Abra e acompanhe seus chamados para o setor de apoio.
							</p>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative w-full md:w-64">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Buscar chamados..."
									className="w-full pl-8"
								/>
							</div>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Novo Chamado
							</Button>
						</div>
					</div>
					<Separator />
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle>Abrir Novo Chamado</CardTitle>
								<CardDescription>
									Preencha o formulário para solicitar suporte.
								</CardDescription>
							</CardHeader>
							<form onSubmit={handleSubmitTicket}>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="title">Título do Chamado</Label>
										<Input
											id="title"
											placeholder="Resumo do problema"
											required
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											disabled={isSubmitting}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="category">Categoria</Label>
										<Select
											value={category}
											onValueChange={setCategory}
											disabled={isSubmitting}
											required
										>
											<SelectTrigger>
												<SelectValue placeholder="Selecione uma categoria" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">Matrícula aluno</SelectItem>
												<SelectItem value="2">Programação acadêmica</SelectItem>
												<SelectItem value="3">
													Regime de acompanhamento
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="priority">Prioridade</Label>
										<Select
											value={priority}
											onValueChange={setPriority}
											disabled={isSubmitting}
											required
										>
											<SelectTrigger>
												<SelectValue placeholder="Selecione a prioridade" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													<div className="flex items-center">
														<span className="priority-indicator priority-low" />
														<span>Baixa</span>
													</div>
												</SelectItem>
												<SelectItem value="2">
													<div className="flex items-center">
														<span className="priority-indicator priority-medium" />
														<span>Média</span>
													</div>
												</SelectItem>
												<SelectItem value="3">
													<div className="flex items-center">
														<span className="priority-indicator priority-high" />
														<span>Alta</span>
													</div>
												</SelectItem>
												<SelectItem value="4">
													<div className="flex items-center">
														<span className="priority-indicator priority-urgent" />
														<span>Urgente</span>
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="description">Descrição</Label>
										<RichTextEditor
											id="description"
											name="description"
											value={description}
											onChange={setDescription}
											placeholder="Descreva detalhadamente o problema ou solicitação"
											minHeight="200px"
											disabled={isSubmitting}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="attachment">Anexo (opcional)</Label>
										<Input
											id="attachment"
											type="file"
											onChange={handleFileChange}
											disabled={isSubmitting}
											accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
										/>
										{file && (
											<FileAttachment
												file={file}
												onRemove={handleRemoveFile}
												className="mt-2"
											/>
										)}
										<p className="text-xs text-muted-foreground">
											Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX
											(máx. 5MB)
										</p>
									</div>
								</CardContent>
								<CardFooter>
									<Button
										type="submit"
										className="w-full submit-button"
										disabled={isSubmitting}
									>
										{isSubmitting ? "Enviando..." : "Enviar Chamado"}
									</Button>
								</CardFooter>
							</form>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Chamados Recentes</CardTitle>
								<CardDescription>Seus últimos chamados abertos</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{tickets.length > 0 ? (
									<div className="space-y-4">
										{tickets.map((ticket) => (
											<div key={ticket.id} className="rounded-lg border p-3">
												<div className="flex items-center justify-between">
													<div className="font-medium">{ticket.name}</div>
													{getStatusBadge(ticket.status)}
												</div>
												<div className="mt-2 flex items-center">
													<PriorityIndicator priority={ticket.priority} />
												</div>
												<div className="mt-1 text-sm text-muted-foreground">
													Aberto em {formatDate(ticket.date_creation)}
												</div>
												<Button
													variant="link"
													className="p-0 h-auto mt-2 text-sm"
													onClick={() =>
														router.push(`/dashboard/ticket/${ticket.id}`)
													}
												>
													Ver detalhes
												</Button>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-6 text-muted-foreground">
										Nenhum chamado encontrado.
									</div>
								)}
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => router.push("/dashboard/tickets")}
								>
									Ver Todos os Chamados
								</Button>
							</CardFooter>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Informações Úteis</CardTitle>
								<CardDescription>
									Recursos e contatos importantes
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg bg-muted p-3">
									<h3 className="font-medium">Horário de Atendimento</h3>
									<p className="text-sm text-muted-foreground">
										Segunda a Sexta: 8h às 18h
									</p>
								</div>
								<div className="rounded-lg bg-muted p-3">
									<h3 className="font-medium">Contato Direto</h3>
									<p className="text-sm text-muted-foreground">
										cead@pucgoias.edu.br
									</p>
									<p className="text-sm text-muted-foreground">
										(62) 3946-1000
									</p>
								</div>
								<div className="rounded-lg bg-muted p-3">
									<h3 className="font-medium">Links Rápidos</h3>
									<ul className="mt-1 space-y-1 text-sm text-muted-foreground">
										<li>
											<a
												href="/manual-do-coordenador"
												className="text-primary hover:underline"
											>
												Manual do Coordenador
											</a>
										</li>
										<li>
											<a
												href="/tutoriais-da-plataforma"
												className="text-primary hover:underline"
											>
												Tutoriais da Plataforma
											</a>
										</li>
										<li>
											<a
												href="/calendario-academico"
												className="text-primary hover:underline"
											>
												Calendário Acadêmico
											</a>
										</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					</div>
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
							href="/policita-de-privacidade"
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
