"use client"

import { DaySection } from "@/components/day-section"
import type { TimeEntry } from "@/lib/types"

interface EntryListProps {
  entries: TimeEntry[]
  onEdit: (entry: TimeEntry) => void
  onDelete: (entry: TimeEntry) => void
}

/** Gruppiert Einträge nach Kalendertag, Reihenfolge bleibt erhalten (neueste zuerst). */
function groupByDay(entries: TimeEntry[]): { dateKey: string; entries: TimeEntry[] }[] {
  const order: string[] = []
  const map = new Map<string, TimeEntry[]>()
  for (const entry of entries) {
    if (!map.has(entry.date)) {
      map.set(entry.date, [])
      order.push(entry.date)
    }
    map.get(entry.date)!.push(entry)
  }
  return order.map((dateKey) => ({ dateKey, entries: map.get(dateKey)! }))
}

export function EntryList({ entries, onEdit, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <p className="px-3 py-8 text-center text-sm text-muted-foreground">
        Noch keine Einträge. Starte oben die Stoppuhr, um loszulegen.
      </p>
    )
  }

  const days = groupByDay(entries)

  return (
    <div className="flex flex-col pb-6">
      {days.map(({ dateKey, entries: dayEntries }) => (
        <DaySection
          key={dateKey}
          dateKey={dateKey}
          entries={dayEntries}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
