import type { GLPITicket, GLPIUser, GLPICategory, GLPIAttachment } from "./glpi"

export interface Notification {
  id: string
  userId: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
  link?: string
  metadata?: Record<string, any>
}

export interface TicketHistoryEntry {
  id: number
  ticketId: number
  userId: number
  userName: string
  action: string
  field?: string
  oldValue?: string
  newValue?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ValidationResult {
  valid: boolean
  message?: string
  fieldErrors?: Record<string, string>
}

export interface FileViewerProps {
  file: {
    id: string | number
    name: string
    url: string
    type: string
    size: number
  }
  onClose: () => void
}

export interface FilterOption {
  id: string
  label: string
  value: any
}

export interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
}

export interface FilterState {
  [key: string]: any
}

export interface MetricData {
  label: string
  value: number
  color?: string
  percentage?: number
  change?: number
  trend?: "up" | "down" | "stable"
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

export interface CacheEntry<T> {
  data: T
  expires: number
}

export interface CacheOptions {
  ttl?: number
  forceRefresh?: boolean
}

export interface ErrorDetails {
  code: string
  message: string
  stack?: string
  context?: Record<string, any>
}

export interface AppError extends Error {
  statusCode: number
  code: string
  details?: ErrorDetails
  isOperational?: boolean
}

export interface User extends GLPIUser {
  role: string
  permissions?: string[]
  preferences?: Record<string, any>
  glpiToken?: string
}

export interface Ticket extends GLPITicket {
  category?: GLPICategory
  requester?: GLPIUser
  assignee?: GLPIUser
  attachments?: GLPIAttachment[]
  history?: TicketHistoryEntry[]
}

export interface Category extends GLPICategory {
  subcategories?: Category[]
}

export interface Attachment extends GLPIAttachment {
  url?: string
  previewUrl?: string
}
