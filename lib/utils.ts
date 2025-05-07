import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Função para obter a primeira letra do email (para avatares)
export function getEmailInitial(email: string): string {
	return email.charAt(0).toUpperCase();
}

// Função para extrair um nome amigável de um endereço de email
export function getNameFromEmail(email: string): string {
	if (!email || typeof email !== "string") return "Usuário";

	// Extrair a parte antes do @
	const localPart = email.split("@")[0];

	// Tratar casos especiais
	if (localPart.includes(".")) {
		// Se tiver ponto, assume que é nome.sobrenome
		const nameParts = localPart.split(".");
		// Capitaliza cada parte e junta com espaço
		return nameParts
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (localPart.includes("_")) {
		// Se tiver underscore, assume que é nome_sobrenome
		const nameParts = localPart.split("_");
		// Capitaliza cada parte e junta com espaço
		return nameParts
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	}

	// Caso padrão: apenas capitaliza a primeira letra
	return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}
