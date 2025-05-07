"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	type GLPICategory,
} from "@/lib/glpi-api";
import { useAuth } from "@/contexts/auth-context";
import { AppHeader } from "@/components/app-header";

export default function AdminCategoriesPage() {
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();

	const [categories, setCategories] = useState<GLPICategory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Estado para edição de categoria
	const [editingCategory, setEditingCategory] = useState<GLPICategory | null>(
		null,
	);
	const [editName, setEditName] = useState("");
	const [editComment, setEditComment] = useState("");

	// Estado para nova categoria
	const [newCategoryName, setNewCategoryName] = useState("");
	const [newCategoryComment, setNewCategoryComment] = useState("");
	const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);

	// Estado para exclusão
	const [categoryToDelete, setCategoryToDelete] = useState<GLPICategory | null>(
		null,
	);

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
				loadCategories();
			}
		}
	}, [user, authLoading, router]);

	// Carregar categorias
	async function loadCategories() {
		try {
			const categoriesData = await getCategories();
			setCategories(categoriesData);
		} catch (error) {
			console.error("Erro ao carregar categorias:", error);
			toast.error("Não foi possível carregar as categorias.");
		} finally {
			setIsLoading(false);
		}
	}

	// Função para criar nova categoria
	const handleCreateCategory = async () => {
		if (!newCategoryName.trim()) {
			toast.error("O nome da categoria é obrigatório.");
			return;
		}

		setIsSubmitting(true);

		try {
			const newCategory: Partial<GLPICategory> = {
				name: newCategoryName.trim(),
				comment: newCategoryComment.trim(),
				entities_id: 1, // Entidade padrão
			};

			await createCategory(newCategory);
			toast.success("Categoria criada com sucesso!");

			// Limpar formulário e fechar diálogo
			setNewCategoryName("");
			setNewCategoryComment("");
			setShowNewCategoryDialog(false);

			// Recarregar categorias
			await loadCategories();
		} catch (error) {
			console.error("Erro ao criar categoria:", error);
			toast.error("Não foi possível criar a categoria.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Função para atualizar categoria
	const handleUpdateCategory = async (id: number) => {
		if (!editName.trim()) {
			toast.error("O nome da categoria é obrigatório.");
			return;
		}

		setIsSubmitting(true);

		try {
			const updatedCategory: Partial<GLPICategory> = {
				name: editName.trim(),
				comment: editComment.trim(),
			};

			await updateCategory(id, updatedCategory);
			toast.success("Categoria atualizada com sucesso!");

			// Limpar estado de edição
			setEditingCategory(null);
			setEditName("");
			setEditComment("");

			// Recarregar categorias
			await loadCategories();
		} catch (error) {
			console.error("Erro ao atualizar categoria:", error);
			toast.error("Não foi possível atualizar a categoria.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Função para excluir categoria
	const handleDeleteCategory = async () => {
		if (!categoryToDelete) return;

		setIsSubmitting(true);

		try {
			await deleteCategory(categoryToDelete.id);
			toast.success("Categoria excluída com sucesso!");

			// Limpar estado de exclusão
			setCategoryToDelete(null);

			// Recarregar categorias
			await loadCategories();
		} catch (error) {
			console.error("Erro ao excluir categoria:", error);
			toast.error("Não foi possível excluir a categoria.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Iniciar edição de categoria
	const startEditing = (category: GLPICategory) => {
		setEditingCategory(category);
		setEditName(category.name);
		setEditComment(category.comment || "");
	};

	// Cancelar edição
	const cancelEditing = () => {
		setEditingCategory(null);
		setEditName("");
		setEditComment("");
	};

	if (authLoading || isLoading) {
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

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader isAdmin={true} />
			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto max-w-4xl">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
							<p className="text-muted-foreground">
								Adicione, edite ou remova categorias de chamados
							</p>
						</div>
						<div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
							<Button variant="default" onClick={() => router.push("/admin")}>
								Voltar ao Dashboard
							</Button>
							<Dialog
								open={showNewCategoryDialog}
								onOpenChange={setShowNewCategoryDialog}
							>
								<DialogTrigger asChild>
									<Button className="mt-2 md:mt-0">
										<Plus className="mr-2 h-4 w-4" />
										Nova Categoria
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Adicionar Nova Categoria</DialogTitle>
										<DialogDescription>
											Preencha os campos abaixo para criar uma nova categoria de
											chamados.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<Label htmlFor="name">Nome da Categoria</Label>
											<Input
												id="name"
												value={newCategoryName}
												onChange={(e) => setNewCategoryName(e.target.value)}
												placeholder="Ex: Suporte Técnico"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="description">Descrição</Label>
											<Textarea
												id="description"
												value={newCategoryComment}
												onChange={(e) => setNewCategoryComment(e.target.value)}
												placeholder="Descreva o propósito desta categoria"
												rows={3}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant="outline"
											onClick={() => setShowNewCategoryDialog(false)}
										>
											Cancelar
										</Button>
										<Button
											onClick={handleCreateCategory}
											disabled={isSubmitting}
										>
											{isSubmitting ? "Salvando..." : "Salvar Categoria"}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Categorias Disponíveis</CardTitle>
							<CardDescription>
								Estas são as categorias que os usuários podem selecionar ao
								criar um chamado.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{categories.length > 0 ? (
								<div className="space-y-4">
									{categories.map((category) => (
										<div key={category.id} className="border rounded-lg p-4">
											{editingCategory?.id === category.id ? (
												// Modo de edição
												<div className="space-y-4">
													<div className="space-y-2">
														<Label htmlFor={`edit-name-${category.id}`}>
															Nome da Categoria
														</Label>
														<Input
															id={`edit-name-${category.id}`}
															value={editName}
															onChange={(e) => setEditName(e.target.value)}
														/>
													</div>
													<div className="space-y-2">
														<Label htmlFor={`edit-description-${category.id}`}>
															Descrição
														</Label>
														<Textarea
															id={`edit-description-${category.id}`}
															value={editComment}
															onChange={(e) => setEditComment(e.target.value)}
															rows={3}
														/>
													</div>
													<div className="flex justify-end gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={cancelEditing}
															disabled={isSubmitting}
														>
															<X className="mr-2 h-4 w-4" />
															Cancelar
														</Button>
														<Button
															size="sm"
															onClick={() => handleUpdateCategory(category.id)}
															disabled={isSubmitting}
														>
															<Save className="mr-2 h-4 w-4" />
															{isSubmitting ? "Salvando..." : "Salvar"}
														</Button>
													</div>
												</div>
											) : (
												// Modo de visualização
												<div>
													<div className="flex items-center justify-between">
														<h3 className="text-lg font-medium">
															{category.name}
														</h3>
														<div className="flex gap-2">
															<Button
																variant="ghost"
																size="sm"
																onClick={() => startEditing(category)}
															>
																<Edit className="h-4 w-4" />
																<span className="sr-only">Editar</span>
															</Button>
															<AlertDialog>
																<AlertDialogTrigger asChild>
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() =>
																			setCategoryToDelete(category)
																		}
																	>
																		<Trash2 className="h-4 w-4 text-destructive" />
																		<span className="sr-only">Excluir</span>
																	</Button>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>
																			Excluir Categoria
																		</AlertDialogTitle>
																		<AlertDialogDescription>
																			Tem certeza que deseja excluir a categoria
																			"{category.name}"? Esta ação não pode ser
																			desfeita.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>
																			Cancelar
																		</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={handleDeleteCategory}
																			className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																		>
																			{isSubmitting
																				? "Excluindo..."
																				: "Excluir"}
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</div>
													{category.comment && (
														<p className="mt-2 text-sm text-muted-foreground">
															{category.comment}
														</p>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<p>Nenhuma categoria encontrada.</p>
									<p className="mt-2">
										Clique em "Nova Categoria" para adicionar a primeira
										categoria.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</main>

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
