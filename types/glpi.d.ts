export interface GLPITicket {
  id: number
  name: string
  content: string
  status: number
  date_creation: string
  date_mod: string
  priority: number
  urgency: number
  impact: number
  itilcategories_id: number
  users_id_recipient: number
  requesttypes_id: number
  entities_id: number
  closedate?: string
  solvedate?: string
  time_to_resolve?: string
  global_validation?: number
  type?: number
  [key: string]: any
}

export interface GLPIUser {
  id: number
  name: string
  firstname?: string
  realname?: string
  email?: string
  phone?: string
  mobile?: string
  locations_id?: number
  profiles_id?: number
  entities_id?: number
  is_active?: boolean
  [key: string]: any
}

export interface GLPICategory {
  id: number
  name: string
  completename?: string
  comment?: string
  level?: number
  ancestors_cache?: string
  sons_cache?: string
  entities_id?: number
  is_recursive?: boolean
  [key: string]: any
}

export interface GLPIAttachment {
  id: number
  name: string
  filename: string
  filepath: string
  mimetype: string
  filesize: number
  date_creation: string
  date_mod: string
  users_id: number
  tickets_id?: number
  [key: string]: any
}

export interface GLPITicketHistory {
  id: number
  itemtype: string
  items_id: number
  date_mod: string
  user_name: string
  id_search_option: number
  old_value: string
  new_value: string
  [key: string]: any
}

export interface GLPISession {
  session_token: string
  app_token?: string
  expires: number
}

export interface GLPIError {
  statusCode: number
  message: string
  errorDetails?: any
}
