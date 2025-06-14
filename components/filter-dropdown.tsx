"use client"

import type React from "react"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FilterDropdownProps {
  children: React.ReactNode
  buttonLabel?: string
}

export function FilterDropdown({ children, buttonLabel = "Filtrar" }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <div className="max-h-[60vh] overflow-y-auto">{children}</div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
