"use client"

import { useState } from "react"
import { Filter, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
  type: "select" | "checkbox" | "radio" | "date" | "text"
  options?: { value: string; label: string }[]
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  value?: any
}

interface AdvancedFiltersProps {
  filters: FilterOption[]
  onFilterChange: (filters: FilterOption[]) => void
  onSearch?: (query: string) => void
  className?: string
}

export function AdvancedFilters({ filters, onFilterChange, onSearch, className }: AdvancedFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>(filters)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleFilterChange = (id: string, value: any) => {
    const updatedFilters = activeFilters.map((filter) => {
      if (filter.id === id) {
        return { ...filter, value }
      }
      return filter
    })

    setActiveFilters(updatedFilters)
  }

  const handleApplyFilters = () => {
    onFilterChange(activeFilters)
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    const resetFilters = activeFilters.map((filter) => ({ ...filter, value: undefined }))
    setActiveFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const getActiveFilterCount = () => {
    return activeFilters.filter((filter) => filter.value !== undefined && filter.value !== "").length
  }

  const renderFilterControl = (filter: FilterOption) => {
    switch (filter.type) {
      case "select":
        return (
          <Select value={filter.value || ""} onValueChange={(value) => handleFilterChange(filter.id, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filter.id}-${option.value}`}
                  checked={Array.isArray(filter.value) ? filter.value?.includes(option.value) : false}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(filter.value) ? [...filter.value] : []
                    if (checked) {
                      handleFilterChange(filter.id, [...currentValues, option.value])
                    } else {
                      handleFilterChange(
                        filter.id,
                        currentValues.filter((v) => v !== option.value),
                      )
                    }
                  }}
                />
                <Label htmlFor={`${filter.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        )

      case "radio":
        return (
          <RadioGroup value={filter.value || ""} onValueChange={(value) => handleFilterChange(filter.id, value)}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id={`${filter.id}-all`} />
                <Label htmlFor={`${filter.id}-all`}>Todos</Label>
              </div>
              {filter.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${filter.id}-${option.value}`} />
                  <Label htmlFor={`${filter.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      case "date":
        return (
          <Input
            type="date"
            value={filter.value || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          />
        )

      case "text":
        return (
          <Input
            type="text"
            value={filter.value || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder="Digite para filtrar..."
          />
        )

      default:
        return null
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-center">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros</h4>
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  Limpar
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                {activeFilters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <Label htmlFor={filter.id}>{filter.label}</Label>
                    {renderFilterControl(filter)}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      {/* Mostrar filtros ativos */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters
            .filter((filter) => filter.value !== undefined && filter.value !== "")
            .map((filter) => {
              let displayValue = ""

              if (filter.type === "select" || filter.type === "radio") {
                const option = filter.options?.find((opt) => opt.value === filter.value)
                displayValue = option?.label || filter.value
              } else if (filter.type === "checkbox" && Array.isArray(filter.value)) {
                const selectedOptions = filter.options?.filter((opt) => filter.value.includes(opt.value))
                displayValue = selectedOptions?.map((opt) => opt.label).join(", ") || filter.value.join(", ")
              } else {
                displayValue = filter.value
              }

              return (
                <Badge key={filter.id} variant="outline" className="flex items-center gap-1">
                  <span>
                    {filter.label}: {displayValue}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFilterChange(filter.id, undefined)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remover filtro</span>
                  </Button>
                </Badge>
              )
            })}
          <Button variant="ghost" size="sm" className="h-6" onClick={handleResetFilters}>
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  )
}
