// Arquivo simplificado para autenticação em desenvolvimento

// Interface para o retorno da função de autenticação
interface AuthResult {
	success: boolean;
	user?: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
	sessionToken?: string;
	error?: string;
}

export async function authenticateWithGLPI(
	username: string,
	password: string,
): Promise<AuthResult> {
	// Simula um atraso de rede
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Em ambiente de desenvolvimento, aceita qualquer credencial com regras simples
	if (process.env.NODE_ENV === "development") {
		// Verifica se o email tem formato válido
		if (!username.includes("@")) {
			return {
				success: false,
				error: "Email inválido",
			};
		}

		// Verifica se a senha tem pelo menos 4 caracteres (regra simples para teste)
		if (password.length < 4) {
			return {
				success: false,
				error: "Senha deve ter pelo menos 4 caracteres",
			};
		}

		// Determina o papel do usuário com base no email
		const isAdmin = username.includes("admin") || username.includes("suporte");

		return {
			success: true,
			// biome-ignore lint/style/useTemplate: <explanation>
			sessionToken: "dev-session-token-" + Date.now(),
			user: {
				id: "1",
				name: isAdmin ? "Administrador" : "Usuário",
				email: username,
				role: isAdmin ? "admin" : "user",
			},
		};
	}

	// Em produção, implementaria a lógica real de autenticação com o GLPI
	// Por enquanto, retorna erro para forçar o uso do modo de desenvolvimento
	return {
		success: false,
		error: "Autenticação com GLPI não configurada em produção",
	};
}
