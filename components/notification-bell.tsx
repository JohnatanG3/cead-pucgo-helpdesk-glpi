"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotificationBell() {
  return (
    <Button variant="ghost" size="icon">
      <Bell className="h-5 w-5" />
      <span className="sr-only">Notificações</span>
    </Button>
  )
}
