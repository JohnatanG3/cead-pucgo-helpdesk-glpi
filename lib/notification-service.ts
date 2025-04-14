import { toast } from "sonner";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
	id: string;
	title: string;
	message: string;
	type: NotificationType;
	timestamp: Date;
	read: boolean;
	link?: string;
}

class NotificationService {
	private notifications: Notification[] = [];
	private listeners: Set<(notifications: Notification[]) => void> = new Set();

	// Adiciona uma nova notificação
	addNotification(
		title: string,
		message: string,
		type: NotificationType = "info",
		link?: string,
	): Notification {
		const notification: Notification = {
			id: crypto.randomUUID(),
			title,
			message,
			type,
			timestamp: new Date(),
			read: false,
			link,
		};

		this.notifications.unshift(notification);

		// Limita a 50 notificações
		if (this.notifications.length > 50) {
			this.notifications = this.notifications.slice(0, 50);
		}

		// Notifica os ouvintes
		this.notifyListeners();

		// Mostra um toast para notificação imediata
		toast[type](title, {
			description: message,
			action: link
				? {
						label: "Ver",
						// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
						onClick: () => (window.location.href = link),
					}
				: undefined,
		});

		return notification;
	}

	// Marca uma notificação como lida
	markAsRead(id: string): void {
		const notification = this.notifications.find((n) => n.id === id);
		if (notification) {
			notification.read = true;
			this.notifyListeners();
		}
	}

	// Marca todas as notificações como lidas
	markAllAsRead(): void {
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.notifications.forEach((n) => (n.read = true));
		this.notifyListeners();
	}

	// Obtém todas as notificações
	getNotifications(): Notification[] {
		return [...this.notifications];
	}

	// Obtém apenas notificações não lidas
	getUnreadNotifications(): Notification[] {
		return this.notifications.filter((n) => !n.read);
	}

	// Adiciona um ouvinte para mudanças nas notificações
	subscribe(listener: (notifications: Notification[]) => void): () => void {
		this.listeners.add(listener);

		// Retorna uma função para cancelar a inscrição
		return () => {
			this.listeners.delete(listener);
		};
	}

	// Notifica todos os ouvintes
	private notifyListeners(): void {
		const notifications = this.getNotifications();
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.listeners.forEach((listener) => listener(notifications));
	}
}

// Exporta uma instância única para uso em toda a aplicação
export const notificationService = new NotificationService();
