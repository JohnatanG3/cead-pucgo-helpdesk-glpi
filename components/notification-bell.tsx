"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  subscribe,
  type Notification,
} from "@/lib/notification-service"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Carregar notificações iniciais
    setNotifications(getNotifications())
    setUnreadCount(getUnreadNotifications().length)

    // Inscrever-se para atualizações
    const unsubscribe = subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications)
      setUnreadCount(getUnreadNotifications().length)
    })

    // Limpar inscrição ao desmontar
    return () => {
      unsubscribe()
    }
  }, [])

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">Notificações</h3>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 transition-colors cursor-pointer",
                    notification.read ? "bg-background" : "bg-muted/30",
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
                      notification.type === "success" && "bg-green-500",
                      notification.type === "error" && "bg-red-500",
                      notification.type === "warning" && "bg-yellow-500",
                      notification.type === "info" && "bg-blue-500",
                    )}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
