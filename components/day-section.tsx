"use client"

import { EntryGroupNode } from "@/components/entry-group-node"
import { EntryRow } from "@/components/entry-row"
import { Separator } from "@/components/ui/separator"
import { formatDaySectionHeader } from "@/lib/time"
import type { TimeEntry } from "@/lib/types"

interface DaySectionProps {
  dateKey: string
  entries: TimeEntry[]
  onEdit: (entry: TimeEntry) => void
  onDelete: (entry: TimeEntry) => void
}

/** Gruppiert die Einträge eines Tages nach Tätigkeit, Reihenfolge bleibt erhalten. */
function groupByActivity(entries: TimeEntry[]): TimeEntry[][] {
  const order: string[] = []
  const map = new Map<string, TimeEntry[]>()
  for (const entry of entries) {
    if (!map.has(entry.activity)) {
      map.set(entry.activity, [])
      order.push(entry.activity)
    }
    map.get(entry.activity)!.push(entry)
  }
  return order.map((activity) => map.get(activity)!)
}

/** Ein Tages-Abschnitt: Tages-Header + gruppierte Einträge (siehe konzept.md, Abschnitt 7). */
export function DaySection({ dateKey, entries, onEdit, onDelete }: DaySectionProps) {
  const groups = groupByActivity(entries)

  return (
    <section className="px-3">
      <p className="pt-3 pb-1 text-xs font-medium text-muted-foreground">
        {formatDaySectionHeader(dateKey)}
      </p>
      <Separator />
      <div className="divide-y divide-border/60">
        {groups.map((group) =>
          group.length > 1 ? (
            <EntryGroupNode
              key={group[0].activity}
              activity={group[0].activity}
              entries={group}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <EntryRow
              key={group[0].id}
              entry={group[0]}
              showActivity
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )
        )}
      </div>
    </section>
  )
}
