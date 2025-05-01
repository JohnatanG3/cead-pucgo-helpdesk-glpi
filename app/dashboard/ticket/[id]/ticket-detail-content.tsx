"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Paperclip, Send, X, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	getTicket,
	getTicketFollowups,
	addTicketFollowup,
	uploadDocument,
	linkDocumentToTicket,
	getUser,
	getGroups,
	mapGLPIStatusToString,
	mapGLPIPriorityToString,
	type GLPITicket,
	type GLPITicketFollowup,
	type GLPIUser,
	type GLPIGroup,
	updateTicket,
	getTicketDocuments,
	deleteDocument,
} from "@/lib/glpi-api";
import { useAuth } from "@/contexts/auth-context";
import { getEmailInitial } from "@/lib/utils";

// Importe o novo componente
import { FileInput } from "@/components/file-input";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";

// Interface para documentos
interface Document {
	id: number;
	name: string;
	filename: string;
	filepath: string;
	mime: string;
	date_creation: string;
	users_id: number;
}

export default function TicketDetailContent({
	ticketId,
}: { ticketId: string }) {
	const { user } = useAuth();
	const router = useRouter();
	const numericTicketId = Number.parseInt(ticketId);

	const [ticket, setTicket] = useState<GLPITicket | null>(null);
	const [followups, setFollowups] = useState<
		Array<GLPITicketFollowup & { user?: GLPIUser }>
	>([]);
	const [assignedUser, setAssignedUser] = useState<GLPIUser | null>(null);
	const [assignedGroup, setAssignedGroup] = useState<GLPIGroup | null>(null);
	const [newComment, setNewComment] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
	const [selectedPriority, setSelectedPriority] = useState<number | null>(null);

	// Estados para o modal de edição
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [editedContent, setEditedContent] = useState("");
	const [isEditing, setIsEditing] = useState(false);

	// Estados para gerenciamento de anexos
	const [ticketDocuments, setTicketDocuments] = useState<Document[]>([]);
	const [documentsToDelete, setDocumentsToDelete] = useState<number[]>([]);
	const [newFiles, setNewFiles] = useState<File[]>([]);
	const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
	const [isDeletingDocument, setIsDeletingDocument] = useState(false);

	// Verificar autenticação
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!user) {
			router.push("/");
			return;
		}

		loadTicketData();
	}, [user, router, numericTicketId]);

	// Carregar dados do ticket
	async function loadTicketData() {
		try {
			const ticketData = await getTicket(numericTicketId);
			setTicket(ticketData);
			setEditedTitle(ticketData.name);
			setEditedContent(ticketData.content);

			// Carregar informações de atribuição
			if (ticketData.users_id_assign) {
				try {
					const userData = await getUser(ticketData.users_id_assign);
					setAssignedUser(userData);
				} catch (error) {
					console.error("Erro ao carregar usuário atribuído:", error);
				}
			}

			if (ticketData.groups_id_assign) {
				try {
					const groupsData = await getGroups();
					const group = groupsData.find(
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						(g: any) => g.id === ticketData.groups_id_assign,
					);
					if (group) {
						setAssignedGroup(group);
					}
				} catch (error) {
					console.error("Erro ao carregar grupo atribuído:", error);
				}
			}

			// Carregar followups
			try {
				const followupsData = await getTicketFollowups(numericTicketId);

				// Verificar se followupsData é um array antes de chamar .map()
				if (Array.isArray(followupsData)) {
					// Para cada followup, carregar informações do usuário
					const followupsWithUsers = await Promise.all(
						followupsData.map(async (followup: GLPITicketFollowup) => {
							try {
								const userData = await getUser(followup.users_id);
								return { ...followup, user: userData };
							} catch (error) {
								console.error(
									`Erro ao carregar usuário ${followup.users_id}:`,
									error,
								);
								return followup;
							}
						}),
					);

					setFollowups(followupsWithUsers);
				} else {
					console.error("followupsData não é um array:", followupsData);
					setFollowups([]);
				}
			} catch (error) {
				console.error("Erro ao carregar followups:", error);
				setFollowups([]);
			}

			// Carregar documentos do ticket
			loadTicketDocuments(numericTicketId);
		} catch (error) {
			console.error("Erro ao carregar dados do ticket:", error);
			toast.error("Não foi possível carregar os detalhes do chamado.");
		} finally {
			setIsLoading(false);
		}
	}

	// Função para carregar documentos do ticket
	async function loadTicketDocuments(ticketId: number) {
		try {
			setIsLoadingDocuments(true);
			const documents = await getTicketDocuments(ticketId);
			setTicketDocuments(documents);
		} catch (error) {
			console.error("Erro ao carregar documentos:", error);
		} finally {
			setIsLoadingDocuments(false);
		}
	}

	useEffect(() => {
		if (ticket) {
			setSelectedStatus(ticket.status);
			setSelectedPriority(ticket.priority);
		}
	}, [ticket]);

	// Verificar se a funcionalidade de resposta está implementada corretamente
	const handleSubmitComment = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Adicionar followup
			await addTicketFollowup({
				tickets_id: numericTicketId,
				content: newComment,
				users_id: user?.id ? Number.parseInt(user.id) : 1, // ID do usuário atual
			});

			// Se tiver arquivo, fazer upload e vincular ao ticket
			if (file) {
				try {
					// Upload do documento
					const document = await uploadDocument(
						file,
						user?.id ? Number.parseInt(user.id) : 1,
					);

					// Vincular documento ao ticket
					await linkDocumentToTicket(document.id, numericTicketId);

					toast.success("Arquivo anexado com sucesso!");
				} catch (uploadError) {
					console.error("Erro ao fazer upload do arquivo:", uploadError);
					toast.error(
						"Não foi possível anexar o arquivo, mas o comentário foi adicionado.",
					);
				}
			}

			toast.success("Seu comentário foi adicionado com sucesso.");

			// Limpar formulário
			setNewComment("");
			setFile(null);

			// Recarregar followups
			const followupsData = await getTicketFollowups(numericTicketId);

			// Verificar se followupsData é um array antes de chamar .map()
			if (Array.isArray(followupsData)) {
				const followupsWithUsers = await Promise.all(
					followupsData.map(async (followup: GLPITicketFollowup) => {
						try {
							const userData = await getUser(followup.users_id);
							return { ...followup, user: userData };
						} catch (error) {
							return followup;
						}
					}),
				);
				setFollowups(followupsWithUsers);
			} else {
				console.error("followupsData não é um array:", followupsData);
				setFollowups([]);
			}

			// Atualizar status e prioridade se foram alterados
			if (
				ticket &&
				(selectedStatus !== ticket.status ||
					selectedPriority !== ticket.priority)
			) {
				try {
					await updateTicket(numericTicketId, {
						status: selectedStatus || ticket.status,
						priority: selectedPriority || ticket.priority,
					});

					// Atualizar o ticket local
					if (ticket) {
						setTicket({
							...ticket,
							status: selectedStatus || ticket.status,
							priority: selectedPriority || ticket.priority,
						});
					}

					toast.success("Status e prioridade atualizados com sucesso!");
				} catch (error) {
					console.error("Erro ao atualizar status e prioridade:", error);
					toast.error("Não foi possível atualizar o status e a prioridade.");
				}
			}
		} catch (error) {
			console.error("Erro ao adicionar comentário:", error);
			toast.error(
				"Não foi possível adicionar o comentário. Tente novamente mais tarde.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Função para marcar um documento para exclusão
	const handleMarkDocumentForDeletion = (documentId: number) => {
		setDocumentsToDelete((prev) => [...prev, documentId]);
	};

	// Função para cancelar a exclusão de um documento
	const handleCancelDocumentDeletion = (documentId: number) => {
		setDocumentsToDelete((prev) => prev.filter((id) => id !== documentId));
	};

	// Função para adicionar novos arquivos
	const handleAddNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const filesArray = Array.from(e.target.files);
			setNewFiles((prev) => [...prev, ...filesArray]);
			e.target.value = ""; // Limpar o input para permitir selecionar o mesmo arquivo novamente
		}
	};

	// Função para remover um novo arquivo
	const handleRemoveNewFile = (index: number) => {
		setNewFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// Função para salvar as edições do chamado
	const handleSaveEdit = async () => {
		if (!ticket) return;

		setIsEditing(true);

		try {
			// 1. Atualizar o título e conteúdo do ticket
			await updateTicket(numericTicketId, {
				name: editedTitle,
				content: editedContent,
			});

			// 2. Excluir documentos marcados para exclusão
			if (documentsToDelete.length > 0) {
				setIsDeletingDocument(true);
				for (const docId of documentsToDelete) {
					try {
						await deleteDocument(docId);
					} catch (error) {
						console.error(`Erro ao excluir documento ${docId}:`, error);
					}
				}
				setIsDeletingDocument(false);
			}

			// 3. Fazer upload e vincular novos documentos
			if (newFiles.length > 0) {
				for (const file of newFiles) {
					try {
						const document = await uploadDocument(
							file,
							user?.id ? Number.parseInt(user.id) : 1,
						);
						await linkDocumentToTicket(document.id, numericTicketId);
					} catch (error) {
						console.error(
							`Erro ao fazer upload do arquivo ${file.name}:`,
							error,
						);
					}
				}
			}

			// Atualizar o ticket local
			setTicket({
				...ticket,
				name: editedTitle,
				content: editedContent,
			});

			// Recarregar documentos
			loadTicketDocuments(numericTicketId);

			// Limpar estados
			setDocumentsToDelete([]);
			setNewFiles([]);

			toast.success("Chamado atualizado com sucesso!");
			setIsEditModalOpen(false);
		} catch (error) {
			console.error("Erro ao atualizar chamado:", error);
			toast.error("Não foi possível atualizar o chamado.");
		} finally {
			setIsEditing(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// biome-ignore lint/complexity/useOptionalChain: <explanation>
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	// Função para formatar a data
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
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

	// Função para mapear prioridade do GLPI para componente Badge
	const getPriorityBadge = (priority: number) => {
		const priorityString = mapGLPIPriorityToString(priority);

		switch (priorityString) {
			case "low":
				return <Badge variant="outline">Baixa</Badge>;
			case "medium":
				return <Badge>Média</Badge>;
			case "high":
				return <Badge variant="destructive">Alta</Badge>;
			case "urgent":
				return <Badge variant="destructive">Urgente</Badge>;
			default:
				return <Badge variant="outline">Baixa</Badge>;
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!ticket) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-xl font-semibold">Chamado não encontrado</p>
					<p className="mt-2 text-muted-foreground">
						O chamado solicitado não existe ou você não tem permissão para
						acessá-lo.
					</p>
					<Button className="mt-4" onClick={() => router.push("/dashboard")}>
						Voltar para Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-10 border-b bg-background">
				<div className="container flex h-16 items-center px-4 md:px-6">
					<Link
						href="/dashboard"
						className="flex items-center gap-2 font-semibold"
					>
						<ArrowLeft className="h-5 w-5" />
						Voltar para Dashboard
					</Link>
				</div>
			</header>

			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto max-w-4xl">
					<div className="mb-6">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<h1 className="text-2xl font-bold">
								Chamado #{ticket.id}: {ticket.name}
							</h1>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsEditModalOpen(true)}
								className="flex items-center gap-1"
							>
								<Edit2 className="h-4 w-4" />
								<span>Editar</span>
							</Button>
						</div>
						<div className="flex flex-wrap items-center gap-2 mt-2">
							<Badge variant="outline">
								Categoria {ticket.itilcategories_id}
							</Badge>
							{getPriorityBadge(ticket.priority)}
							{getStatusBadge(ticket.status)}
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							Aberto em {formatDate(ticket.date_creation)}
						</p>

						{/* Mostrar informações de atribuição */}
						{(assignedUser || assignedGroup) && (
							<div className="mt-2">
								<p className="text-sm">
									<span className="font-medium">Atribuído a: </span>
									{assignedUser ? (
										<span>{assignedUser.name}</span>
									) : assignedGroup ? (
										<span>Grupo {assignedGroup.name}</span>
									) : (
										<span>Não atribuído</span>
									)}
								</p>
							</div>
						)}
					</div>

					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Descrição do Problema</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{ticket.content}</p>

							{/* Exibir anexos do ticket */}
							{ticketDocuments.length > 0 && (
								<div className="mt-4 pt-4 border-t">
									<h3 className="text-sm font-medium mb-2">Anexos:</h3>
									<div className="flex flex-wrap gap-2">
										{ticketDocuments.map((doc) => (
											<div
												key={doc.id}
												className="flex items-center gap-2 p-2 border rounded-md"
											>
												<Paperclip className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">{doc.filename}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Histórico de Comunicação</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{followups.length > 0 ? (
								followups.map((followup) => (
									<div
										key={followup.id}
										className={`p-3 border rounded-lg ${followup.users_id !== ticket.users_id_recipient ? "bg-muted/50" : ""}`}
									>
										<div className="flex items-center gap-2">
											<Avatar className="h-8 w-8">
												<AvatarImage
													src="/placeholder.svg?height=32&width=32"
													alt={followup.user?.name || "Usuário"}
												/>
												<AvatarFallback>
													{followup.user?.email
														? getEmailInitial(followup.user.email)
														: "U"}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">
													{followup.user?.name ||
														`Usuário #${followup.users_id}`}
													{followup.users_id !== ticket.users_id_recipient && (
														<span className="ml-2 text-xs text-muted-foreground">
															(Atendente)
														</span>
													)}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatDate(followup.date_creation)}
												</p>
											</div>
										</div>
										<p className="mt-2">{followup.content}</p>
									</div>
								))
							) : (
								<div className="text-center py-6 text-muted-foreground">
									Nenhuma comunicação registrada.
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Adicionar Comentário</CardTitle>
						</CardHeader>
						<form onSubmit={handleSubmitComment}>
							<CardContent className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2 mb-4">
									<div>
										<Label htmlFor="status">Status do Chamado</Label>
										<Select
											value={selectedStatus?.toString() || ""}
											onValueChange={(value) =>
												setSelectedStatus(Number(value))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Selecione o status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">Novo</SelectItem>
												<SelectItem value="2">Pendente</SelectItem>
												<SelectItem value="3">Em andamento</SelectItem>
												<SelectItem value="4">Resolvido</SelectItem>
												<SelectItem value="5">Fechado</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="priority">Prioridade</Label>
										<Select
											value={selectedPriority?.toString() || ""}
											onValueChange={(value) =>
												setSelectedPriority(Number(value))
											}
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
								</div>
								<RichTextEditor
									id="comment"
									name="comment"
									value={newComment}
									onChange={setNewComment}
									placeholder="Digite seu comentário ou dúvida adicional..."
									minHeight="200px"
									disabled={isSubmitting}
								/>
								{/* Substitua o input de arquivo existente por: */}
								<div className="space-y-2">
									<FileInput
										id="attachment"
										onChange={handleFileChange}
										disabled={isSubmitting}
										accept="*/*" // Aceita todos os tipos de arquivos
										buttonText="Anexar arquivo"
										selectedFiles={file ? [file] : []} // Convertendo o único arquivo em um array
									/>
									{file && (
										<div className="flex items-center gap-2 p-2 border rounded">
											<Paperclip className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">{file.name}</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="ml-auto h-6 w-6 p-0"
												onClick={() => setFile(null)}
											>
												<span className="sr-only">Remover</span>
												<X className="h-4 w-4" />
											</Button>
										</div>
									)}
									<p className="text-xs text-muted-foreground">
										Todos os tipos de arquivos são aceitos (máx. 5MB)
									</p>
								</div>
							</CardContent>
							<CardFooter>
								<Button type="submit" variant="default" disabled={isSubmitting}>
									<Send className="mr-2 h-4 w-4" />
									{isSubmitting ? "Enviando..." : "Enviar Comentário"}
								</Button>
							</CardFooter>
						</form>
					</Card>
				</div>
			</main>

			{/* Modal de edição */}
			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>Editar Chamado #{ticket.id}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4 overflow-y-auto pr-2">
						<div className="space-y-2">
							<Label htmlFor="title">Título do Chamado</Label>
							<input
								id="title"
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								className="w-full rounded-md border border-input bg-background px-3 py-2"
								placeholder="Título do chamado"
								disabled={isEditing}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="content">Descrição do Problema</Label>
							<RichTextEditor
								id="content"
								name="content"
								value={editedContent}
								onChange={setEditedContent}
								placeholder="Descreva o problema em detalhes..."
								minHeight="150px"
								disabled={isEditing}
							/>
						</div>

						{/* Seção de gerenciamento de anexos */}
						<div className="space-y-2 pt-4 border-t">
							<Label>Anexos Existentes</Label>
							{isLoadingDocuments ? (
								<div className="text-center py-2">
									{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
									<p className="text-xs text-muted-foreground mt-1">
										Carregando anexos...
									</p>
								</div>
							) : ticketDocuments.length > 0 ? (
								<div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
									{ticketDocuments.map((doc) => (
										<div
											key={doc.id}
											className="flex items-center justify-between p-2 border rounded-md"
										>
											<div className="flex items-center gap-2">
												<Paperclip className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm truncate max-w-[250px]">
													{doc.filename}
												</span>
											</div>
											{documentsToDelete.includes(doc.id) ? (
												<div className="flex items-center gap-2">
													<span className="text-xs text-red-500">
														Será excluído
													</span>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => handleCancelDocumentDeletion(doc.id)}
														disabled={isEditing || isDeletingDocument}
													>
														Cancelar
													</Button>
												</div>
											) : (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="text-red-500 hover:text-red-700"
													onClick={() => handleMarkDocumentForDeletion(doc.id)}
													disabled={isEditing || isDeletingDocument}
												>
													<Trash2 className="h-4 w-4" />
													<span className="sr-only">Excluir</span>
												</Button>
											)}
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									Nenhum anexo encontrado.
								</p>
							)}

							{/* Adicionar novos anexos */}
							<div className="mt-4">
								<Label>Adicionar Novos Anexos</Label>
								<FileInput
									id="new-attachments"
									onChange={handleAddNewFiles}
									disabled={isEditing}
									accept="*/*"
									multiple
									buttonText="Selecionar arquivos"
								/>

								{newFiles.length > 0 && (
									<div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto pr-2">
										{newFiles.map((file, index) => (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												key={index}
												className="flex items-center justify-between p-2 border rounded-md"
											>
												<div className="flex items-center gap-2">
													<Paperclip className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm truncate max-w-[250px]">
														{file.name}
													</span>
													<span className="text-xs text-muted-foreground">
														({(file.size / 1024).toFixed(1)} KB)
													</span>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => handleRemoveNewFile(index)}
													disabled={isEditing}
												>
													<X className="h-4 w-4" />
													<span className="sr-only">Remover</span>
												</Button>
											</div>
										))}
									</div>
								)}
								<p className="text-xs text-muted-foreground mt-1">
									Todos os tipos de arquivos são aceitos (máx. 5MB)
								</p>
							</div>
						</div>
					</div>
					<DialogFooter className="pt-2 border-t mt-2">
						<Button
							variant="outline"
							onClick={() => {
								setIsEditModalOpen(false);
								setDocumentsToDelete([]);
								setNewFiles([]);
							}}
							disabled={isEditing}
						>
							Cancelar
						</Button>
						<Button
							onClick={handleSaveEdit}
							disabled={
								isEditing || !editedTitle.trim() || !editedContent.trim()
							}
						>
							{isEditing ? "Salvando..." : "Salvar Alterações"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<footer className="border-t py-4">
				<div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
					<p className="text-center text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} CEAD - Coordenação de Educação a
						Distância - PUC GO. Todos os direitos reservados.
					</p>
				</div>
			</footer>
		</div>
	);
}
