"use client"

import { ChevronRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { EntryRow } from "@/components/entry-row"
import { formatDurationMs } from "@/lib/time"
import type { TimeEntry } from "@/lib/types"

interface EntryGroupNodeProps {
  activity: string
  entries: TimeEntry[]
  onEdit: (entry: TimeEntry) => void
  onDelete: (entry: TimeEntry) => void
}

/**
 * Baum-Node für ≥2 Einträge derselben Tätigkeit am selben Tag (siehe
 * konzept.md, Abschnitt 7 "Gruppierung als Baum"), gebaut mit Collapsible +
 * Tree-Linie in Anlehnung an das "File Tree"-Beispiel der Collapsible-Doku.
 */
export function EntryGroupNode({
  activity,
  entries,
  onEdit,
  onDelete,
}: EntryGroupNodeProps) {
  const totalMs = entries.reduce((sum, e) => sum + e.durationMs, 0)

  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-left text-sm [&[data-state=open]_svg]:rotate-90">
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform" />
        <span className="min-w-0 flex-1 truncate font-medium">{activity}</span>
        <Badge variant="outline" className="shrink-0 tabular-nums">
          {formatDurationMs(totalMs)}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-2 border-l pl-2">
        {entries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            showActivity={false}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
