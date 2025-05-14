export const APP_CONFIG = {
  APP_NAME: "CEAD Ticket System",
  APP_VERSION: "1.0.0",
  APP_DESCRIPTION: "Sistema de Chamados do CEAD - PUC Goiás",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  DEFAULT_LOCALE: "pt-BR",
  DEFAULT_TIMEZONE: "America/Sao_Paulo",
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  CACHE: {
    ENABLED: true,
    TTL: 300, // 5 minutos em segundos
    PREFIX: "cead_ticket_system:",
  },
  UPLOADS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "application/zip",
      "application/x-rar-compressed",
    ],
    STORAGE_PATH: "./public/uploads",
  },
  SECURITY: {
    SESSION_DURATION: 8 * 60 * 60, // 8 horas em segundos
    REFRESH_TOKEN_DURATION: 7 * 24 * 60 * 60, // 7 dias em segundos
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRES_UPPERCASE: true,
    PASSWORD_REQUIRES_LOWERCASE: true,
    PASSWORD_REQUIRES_NUMBER: true,
    PASSWORD_REQUIRES_SYMBOL: true,
  },
  NOTIFICATIONS: {
    ENABLED: true,
    EMAIL: {
      ENABLED: false,
      FROM: "noreply@pucgo.edu.br",
      TEMPLATES: {
        NEW_TICKET: "new-ticket",
        TICKET_UPDATED: "ticket-updated",
        TICKET_CLOSED: "ticket-closed",
        TICKET_REOPENED: "ticket-reopened",
        PASSWORD_RESET: "password-reset",
      },
    },
    PUSH: {
      ENABLED: false,
    },
    IN_APP: {
      ENABLED: true,
      MAX_AGE: 30 * 24 * 60 * 60, // 30 dias em segundos
    },
  },
  ROLES: {
    ADMIN: "admin",
    USER: "user",
  },
  FEATURES: {
    DARK_MODE: true,
    FILE_ATTACHMENTS: true,
    RICH_TEXT_EDITOR: true,
    TICKET_HISTORY: true,
    METRICS_DASHBOARD: true,
    ADVANCED_FILTERS: true,
    REAL_TIME_VALIDATION: true,
    NOTIFICATIONS: true,
  },
}
