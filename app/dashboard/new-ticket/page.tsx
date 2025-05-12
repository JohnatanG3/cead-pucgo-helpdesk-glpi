"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/form-field";
import { RichTextEditor } from "@/components/rich-text-editor";
import { FileInput } from "@/components/file-input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { PriorityIndicator } from "@/components/priority-indicator";
import {
	createTicket,
	uploadDocument,
	linkDocumentToTicket,
	getCategories,
	handleApiRequest,
} from "@/lib/glpi-api";
import { useAuth } from "@/contexts/auth-context";
import { notificationService } from "@/lib/notification-service";
import { AppHeader } from "@/components/app-header";
import { Label } from "@/components/ui/label";

export default function NewTicketPage() {
	const router = useRouter();
	const { user } = useAuth();

	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [priority, setPriority] = useState("");
	const [description, setDescription] = useState("");
	const [files, setFiles] = useState<File[]>([]);

	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingCategories, setIsLoadingCategories] = useState(true);
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [categories, setCategories] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Carregar categorias - corrigido para usar useEffect
	useEffect(() => {
		handleApiRequest(
			() => getCategories(),
			"Não foi possível carregar as categorias",
		)
			.then((data) => {
				setCategories(data);
			})
			.finally(() => {
				setIsLoadingCategories(false);
			});
	}, []); // Array de dependências vazio para executar apenas uma vez na montagem

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validação básica
		if (!title.trim()) {
			setError("O título do chamado é obrigatório");
			return;
		}

		if (!category) {
			setError("Selecione uma categoria");
			return;
		}

		if (!priority) {
			setError("Selecione uma prioridade");
			return;
		}

		if (!description.trim()) {
			setError("A descrição do chamado é obrigatória");
			return;
		}

		setIsSubmitting(true);

		try {
			// Criar o chamado
			const ticketData = {
				name: title,
				content: description,
				itilcategories_id: Number(category),
				priority: Number(priority),
				status: 1,
				type: 1,
				users_id_recipient: user?.id ? Number(user.id) : 1,
			};

			const result = await handleApiRequest(
				() => createTicket(ticketData),
				"Não foi possível criar o chamado",
				true,
				"Chamado criado com sucesso!",
			);

			// Upload de arquivos
			if (files.length > 0) {
				try {
					for (const file of files) {
						const document = await uploadDocument(
							file,
							user?.id ? Number(user.id) : 1,
						);
						await linkDocumentToTicket(document.id, result.id);
					}

					notificationService.addNotification(
						"Arquivos anexados",
						`${files.length} arquivo(s) anexado(s) com sucesso!`,
						"success",
					);
				} catch (error) {
					notificationService.handleApiError(
						error,
						"Alguns arquivos não puderam ser anexados, mas o chamado foi criado",
					);
				}
			}

			// Redirecionar para a página do chamado
			router.push(`/dashboard/ticket/${result.id}`);
		} catch (error) {
			console.error("Erro ao criar chamado:", error);
			// O erro já foi tratado pelo handleApiRequest
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const newFiles = Array.from(e.target.files);
			setFiles((prev) => [...prev, ...newFiles]);
			e.target.value = "";
		}
	};

	const handleRemoveFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// Renderizar o conteúdo personalizado para o SelectValue
	const renderPriorityValue = () => {
		if (!priority)
			return (
				<span className="text-muted-foreground">Selecione a prioridade</span>
			);

		return <PriorityIndicator priority={Number(priority)} />;
	};

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader />
			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto max-w-3xl">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Abrir Novo Chamado</h1>
						<p className="text-muted-foreground">
							Preencha as informações abaixo para criar um novo chamado.
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Detalhes do Chamado</CardTitle>
							<CardDescription>
								Preencha as informações abaixo para criar um novo chamado.
							</CardDescription>
						</CardHeader>

						<form onSubmit={handleSubmit}>
							<CardContent className="space-y-4">
								{error && (
									<ErrorMessage
										message="Erro ao criar chamado"
										details={error}
										severity="error"
									/>
								)}

								<FormField
									id="title"
									label="Título do Chamado"
									placeholder="Resumo do problema"
									value={title}
									onChange={setTitle}
									required
									minLength={5}
									maxLength={100}
									disabled={isLoading}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
										<label className="text-sm font-medium">Categoria</label>
										{isLoadingCategories ? (
											<div className="h-10 flex items-center">
												<LoadingSpinner
													size="sm"
													text="Carregando categorias..."
												/>
											</div>
										) : (
											<Select
												value={category}
												onValueChange={setCategory}
												disabled={isLoading}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione uma categoria" />
												</SelectTrigger>
												<SelectContent>
													{categories.map((cat) => (
														<SelectItem key={cat.id} value={cat.id.toString()}>
															{cat.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									</div>

									<div className="space-y-2">
										{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
										<label className="text-sm font-medium">Prioridade</label>
										<Select
											value={priority}
											onValueChange={setPriority}
											disabled={isLoading}
										>
											<SelectTrigger>{renderPriorityValue()}</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													<PriorityIndicator priority={1} />
												</SelectItem>
												<SelectItem value="2">
													<PriorityIndicator priority={2} />
												</SelectItem>
												<SelectItem value="3">
													<PriorityIndicator priority={3} />
												</SelectItem>
												<SelectItem value="4">
													<PriorityIndicator priority={4} />
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
									<label className="text-sm font-medium">Solicitante</label>
									<div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
										<User className="h-4 w-4 text-muted-foreground" />
										<span>{user?.email || "Usuário"}</span>
									</div>
									<p className="text-xs text-muted-foreground">
										Chamado será aberto em seu nome
									</p>
								</div>

								<div className="space-y-2">
									{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
									<label className="text-sm font-medium">Descrição</label>
									<RichTextEditor
										id="description"
										name="description"
										value={description}
										onChange={setDescription}
										placeholder="Descreva detalhadamente o problema ou solicitação"
										minHeight="200px"
										disabled={isLoading}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="attachment">Anexos (opcional)</Label>
									<FileInput
										id="attachment"
										onChange={handleFileChange}
										disabled={isSubmitting}
										accept="*/*" // Aceita todos os tipos de arquivos
										multiple
										selectedFiles={files}
										onRemove={handleRemoveFile}
										buttonLabel="Selecionar arquivo"
									/>
									<p className="text-xs text-muted-foreground">
										Todos os tipos de arquivos são aceitos (máx. 5MB por
										arquivo)
									</p>
								</div>
								{/* Remova ou comente esta linha: */}
								{/* {files.length > 0 && <FileAttachment files={files} onRemove={handleRemoveFile} className="mt-2" />} */}
							</CardContent>

							<CardFooter className="flex justify-between gap-4 pt-6 border-t">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push("/dashboard")}
									disabled={isLoading}
									className="w-1/3"
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									variant="default"
									disabled={isLoading}
									className="w-2/3 bg-cead-blue hover:bg-cead-blue/90"
								>
									{isLoading ? (
										<LoadingSpinner size="sm" text="Enviando chamado..." />
									) : (
										"Criar Chamado"
									)}
								</Button>
							</CardFooter>
						</form>
					</Card>
				</div>
			</main>
		</div>
	);
}
