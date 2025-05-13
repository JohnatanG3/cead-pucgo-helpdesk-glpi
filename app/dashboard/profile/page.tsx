"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Shield } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/app-header";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { getEmailInitial } from "@/lib/utils";

export default function ProfilePage() {
	const { user } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	// Form states
	const [name, setName] = useState(user?.name || "");

	// Get user initial for avatar
	const userInitial = user?.email ? getEmailInitial(user.email) : "U";

	// Extract name from email if available
	const emailName = user?.email ? user.email.split("@")[0] : "";
	const displayName = user?.name || emailName || "Usuário";

	const handleUpdateProfile = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			toast.success("Perfil atualizado com sucesso!");
			setIsLoading(false);
		}, 1000);
	};

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader />

			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto max-w-4xl">
					<div className="flex items-center mb-6">
						<Button
							variant="ghost"
							size="sm"
							className="mr-2"
							onClick={() => router.push("/dashboard")}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Voltar ao Dashboard
						</Button>
					</div>

					<div className="flex flex-col md:flex-row gap-6 mb-6">
						<Card className="w-full md:w-1/3">
							<CardHeader className="text-center">
								<Avatar className="h-24 w-24 mx-auto">
									<AvatarFallback className="text-2xl">
										{userInitial}
									</AvatarFallback>
								</Avatar>
								<CardTitle className="mt-4">{displayName}</CardTitle>
								<CardDescription>{user?.email}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center">
										<Mail className="h-4 w-4 mr-2 text-muted-foreground" />
										<span>{user?.email}</span>
									</div>
									<div className="flex items-center">
										<Shield className="h-4 w-4 mr-2 text-muted-foreground" />
										<span>Usuário</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="w-full md:w-2/3">
							<Card>
								<CardHeader>
									<CardTitle>Informações Pessoais</CardTitle>
									<CardDescription>
										Atualize suas informações de perfil
									</CardDescription>
								</CardHeader>
								<form onSubmit={handleUpdateProfile}>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name">Nome Completo</Label>
											<Input
												id="name"
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="Seu nome completo"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												value={user?.email}
												disabled
												placeholder="seu.email@pucgoias.edu.br"
											/>
											<p className="text-xs text-muted-foreground">
												O email não pode ser alterado
											</p>
										</div>

										<div className="p-4 bg-muted/50 rounded-md">
											<p className="text-sm">
												<strong>Nota:</strong> Para alteração de senha ou
												recuperação de acesso, utilize o portal institucional da
												PUC-GO.
											</p>
										</div>
									</CardContent>
									<CardFooter className="pt-6">
										<Button type="submit" disabled={isLoading}>
											{isLoading ? "Salvando..." : "Salvar Alterações"}
										</Button>
									</CardFooter>
								</form>
							</Card>
						</div>
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
