"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	Clock,
	FileText,
	User,
	Edit2,
	Trash2,
	Paperclip,
	X,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileInput } from "@/components/file-input";
import { PriorityIndicator } from "@/components/priority-indicator";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
	addTicketFollowup,
	getTicketFollowups,
	updateTicket,
	uploadDocument,
	linkDocumentToTicket,
	getTicketDocuments,
	deleteDocument,
} from "@/lib/glpi-api";
import { useAuth } from "@/contexts/auth-context";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getEmailInitial } from "@/lib/utils";

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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function AdminTicketDetailContent({ ticket }: { ticket: any }) {
	const router = useRouter();
	const { user, logout } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [followups, setFollowups] = useState<any[]>([]);
	const [isLoadingFollowups, setIsLoadingFollowups] = useState(true);
	const [responseContent, setResponseContent] = useState("");
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [selectedStatus, setSelectedStatus] = useState(ticket?.status || 1);
	const [selectedPriority, setSelectedPriority] = useState(
		ticket?.priority || 3,
	);

	// Estados para o modal de edição
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editedTitle, setEditedTitle] = useState(ticket?.name || "");
	const [editedContent, setEditedContent] = useState(ticket?.content || "");
	const [isEditing, setIsEditing] = useState(false);

	// Estados para gerenciamento de anexos
	const [ticketDocuments, setTicketDocuments] = useState<Document[]>([]);
	const [documentsToDelete, setDocumentsToDelete] = useState<number[]>([]);
	const [newFiles, setNewFiles] = useState<File[]>([]);
	const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
	const [isDeletingDocument, setIsDeletingDocument] = useState(false);

	// Carregar followups ao montar o componente
	useState(() => {
		if (ticket?.id) {
			loadFollowups();
			loadTicketDocuments(ticket.id);
		}
	});

	// Carregar followups do ticket
	async function loadFollowups() {
		try {
			setIsLoadingFollowups(true);
			const followupsData = await getTicketFollowups(ticket.id);
			setFollowups(followupsData);
		} catch (error) {
			console.error("Erro ao carregar followups:", error);
			toast.error("Não foi possível carregar as respostas do chamado.");
		} finally {
			setIsLoadingFollowups(false);
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

	// Enviar resposta
	async function handleSubmitResponse() {
		if (!responseContent.trim()) {
			toast.error("Por favor, digite uma resposta.");
			return;
		}

		try {
			setIsSubmitting(true);

			// Adicionar followup
			await addTicketFollowup({
				tickets_id: ticket.id,
				content: responseContent,
				is_private: 0, // Público
			});

			// Fazer upload de cada arquivo, se houver
			if (selectedFiles.length > 0) {
				for (const file of selectedFiles) {
					try {
						const document = await uploadDocument(
							file,
							user?.id ? Number.parseInt(user.id) : 1,
						);
						await linkDocumentToTicket(document.id, ticket.id);
					} catch (error) {
						console.error("Erro ao fazer upload do arquivo:", error);
					}
				}
			}

			// Atualizar status e prioridade se necessário
			if (
				selectedStatus !== ticket.status ||
				selectedPriority !== ticket.priority
			) {
				await updateTicket(ticket.id, {
					status: selectedStatus,
					priority: selectedPriority,
				});
			}

			toast.success("Resposta enviada com sucesso!");
			setResponseContent("");
			setSelectedFiles([]);
			loadFollowups(); // Recarregar followups
		} catch (error) {
			console.error("Erro ao enviar resposta:", error);
			toast.error("Não foi possível enviar a resposta.");
		} finally {
			setIsSubmitting(false);
		}
	}

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
			await updateTicket(ticket.id, {
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
						await linkDocumentToTicket(document.id, ticket.id);
					} catch (error) {
						console.error(
							`Erro ao fazer upload do arquivo ${file.name}:`,
							error,
						);
					}
				}
			}

			// Atualizar o ticket local
			ticket.name = editedTitle;
			ticket.content = editedContent;

			// Recarregar documentos
			loadTicketDocuments(ticket.id);

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

	// Formatar data
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Mapear status para texto
	const mapStatusToText = (status: number) => {
		switch (status) {
			case 1:
				return "Novo";
			case 2:
				return "Pendente";
			case 3:
				return "Em andamento";
			case 4:
				return "Resolvido";
			case 5:
				return "Fechado";
			case 6:
				return "Rejeitado";
			default:
				return "Desconhecido";
		}
	};

	// Mapear prioridade para texto
	const mapPriorityToText = (priority: number) => {
		switch (priority) {
			case 1:
				return "Muito baixa";
			case 2:
				return "Baixa";
			case 3:
				return "Média";
			case 4:
				return "Alta";
			case 5:
				return "Muito alta";
			default:
				return "Média";
		}
	};

	if (!ticket) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-500 mb-4">
						Chamado não encontrado
					</h2>
					<p className="text-muted-foreground">
						O chamado solicitado não foi encontrado.
					</p>
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button
						onClick={() => router.push("/admin")}
						className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
					>
						Voltar para o Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">

			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto max-w-4xl">
					<div className="mb-6">
						<Link
							href="/admin"
							className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Voltar para o Dashboard
						</Link>
					</div>

					<div className="grid gap-6">
						<Card>
							<CardHeader>
								<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
									<div>
										<div className="flex items-center gap-2">
											<CardTitle className="text-2xl">
												Chamado #{ticket.id}
											</CardTitle>
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
										<CardDescription>{ticket.name}</CardDescription>
									</div>
									<div className="flex flex-wrap gap-2">
										<div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span>{formatDate(ticket.date_creation)}</span>
										</div>
										<div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm">
											<User className="h-4 w-4 text-muted-foreground" />
											<span>Usuário #{ticket.users_id_recipient}</span>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<h3 className="text-sm font-medium mb-2">Descrição</h3>
										<div
											className="rounded-md border border-input bg-muted/40 p-4 text-sm"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
											dangerouslySetInnerHTML={{ __html: ticket.content }}
										/>

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
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Histórico de respostas - Removido conforme solicitado */}
						{followups.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Respostas anteriores</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{followups.map((followup) => (
											<div key={followup.id} className="rounded-lg border p-4">
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center gap-2">
														<Avatar className="h-8 w-8">
															<AvatarFallback>
																{followup.users_id === ticket.users_id_recipient
																	? getEmailInitial(
																			followup.user?.email || "Usuário",
																		)
																	: getEmailInitial(
																			followup.user?.email || "Atendente",
																		)}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className="text-sm font-medium">
																{followup.users_id === ticket.users_id_recipient
																	? "Solicitante"
																	: "Atendente"}
															</p>
															<p className="text-xs text-muted-foreground">
																{formatDate(followup.date_creation)}
															</p>
														</div>
													</div>
													{followup.is_private ? (
														<span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
															Privado
														</span>
													) : null}
												</div>
												<div
													className="text-sm mt-2"
													// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
													dangerouslySetInnerHTML={{ __html: followup.content }}
												/>
												{followup.documents &&
													followup.documents.length > 0 && (
														<div className="mt-3 pt-3 border-t">
															<p className="text-xs font-medium mb-2">
																Anexos:
															</p>
															<div className="flex flex-wrap gap-2">
																{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
																{followup.documents.map((doc: any) => (
																	<a
																		key={doc.id}
																		href={doc.download_url}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80"
																	>
																		<FileText className="h-3 w-3" />
																		{doc.filename}
																	</a>
																))}
															</div>
														</div>
													)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						<Card>
							<CardHeader>
								<CardTitle>Adicionar Resposta</CardTitle>
								<CardDescription>
									Responda ao chamado e atualize seu status
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Controles de status e prioridade movidos para cá */}
									<div className="grid gap-4 md:grid-cols-2">
										<div>
											<h3 className="text-sm font-medium">Status</h3>
											<div className="mt-1">
												<select
													value={selectedStatus}
													onChange={(e) =>
														setSelectedStatus(Number(e.target.value))
													}
													className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
												>
													<option value={1}>Novo</option>
													<option value={2}>Pendente</option>
													<option value={3}>Em andamento</option>
													<option value={4}>Resolvido</option>
													<option value={5}>Fechado</option>
												</select>
											</div>
											<p className="mt-1 text-xs text-muted-foreground">
												Status atual: {mapStatusToText(ticket.status)}
											</p>
										</div>
										<div>
											<h3 className="text-sm font-medium">Prioridade</h3>
											<div className="mt-1">
												<select
													value={selectedPriority}
													onChange={(e) =>
														setSelectedPriority(Number(e.target.value))
													}
													className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
												>
													<option value={1}>Muito baixa</option>
													<option value={2}>Baixa</option>
													<option value={3}>Média</option>
													<option value={4}>Alta</option>
													<option value={5}>Muito alta</option>
												</select>
											</div>
											<div className="mt-1 text-xs text-muted-foreground">
												Prioridade atual:{" "}
												<PriorityIndicator priority={ticket.priority} />
											</div>
										</div>
									</div>

									<Separator className="my-2" />

									<div>
										<RichTextEditor
											id="response-content"
											name="response-content"
											value={responseContent}
											onChange={setResponseContent}
											placeholder="Digite sua resposta aqui..."
										/>
									</div>
									<div>
										<FileInput
											id="attachment"
											onChange={(e) => {
												if (e.target.files && e.target.files.length > 0) {
													const newFiles = Array.from(e.target.files);
													setSelectedFiles((prevFiles) => [
														...prevFiles,
														...newFiles,
													]);
													e.target.value = "";
												}
											}}
											buttonText="Anexar arquivos"
											accept="*/*" // Aceita todos os tipos de arquivos
											multiple
											selectedFiles={selectedFiles}
											onRemove={(index: number) => {
												setSelectedFiles((prevFiles) =>
													prevFiles.filter((_, i) => i !== index),
												);
											}}
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-between">
								<Button variant="outline" onClick={() => router.push("/admin")}>
									Cancelar
								</Button>
								<Button
									onClick={handleSubmitResponse}
									disabled={isSubmitting || !responseContent.trim()}
								>
									{isSubmitting ? "Enviando..." : "Enviar Resposta"}
								</Button>
							</CardFooter>
						</Card>
					</div>
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
