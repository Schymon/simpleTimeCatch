"use client"

import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ActivityComboboxProps {
  id?: string
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  autoFocus?: boolean
  placeholder?: string
}

/**
 * Tätigkeit-Eingabe als Dropdown der bisher verwendeten Tätigkeiten, mit
 * freier Custom-Eingabe. Bewusst nur mit Radix-Primitiven (Popover) gebaut,
 * ohne das cmdk-basierte shadcn "Command" (siehe konzept.md, Abschnitt 8.2).
 */
export function ActivityCombobox({
  id,
  value,
  onChange,
  suggestions,
  autoFocus,
  placeholder,
}: ActivityComboboxProps) {
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase()
    const unique = Array.from(new Set(suggestions.filter(Boolean)))
    const matches = query
      ? unique.filter(
          (s) => s.toLowerCase().includes(query) && s.toLowerCase() !== query
        )
      : unique
    return matches.slice(0, 8)
  }, [suggestions, value])

  const showPopover = open && filtered.length > 0

  return (
    <Popover open={showPopover} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          id={id}
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder ?? "Tätigkeit eingeben oder auswählen"}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--radix-popover-trigger-width) p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto">
          {filtered.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(suggestion)
                setOpen(false)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
