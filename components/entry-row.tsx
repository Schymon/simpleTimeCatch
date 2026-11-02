"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  dateKeyInBerlin,
  formatDurationMs,
  formatShortDateBerlin,
  formatTimeBerlin,
} from "@/lib/time"
import type { TimeEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EntryRowProps {
  entry: TimeEntry
  /** true bei einzelnen Einträgen ohne Gruppen-Node, false bei Kind-Zeilen im Baum. */
  showActivity: boolean
  onEdit: (entry: TimeEntry) => void
  onDelete: (entry: TimeEntry) => void
}

/** Eine Zeile pro Eintrag – bewusst so schlank wie möglich (siehe konzept.md, Abschnitt 7). */
export function EntryRow({ entry, showActivity, onEdit, onDelete }: EntryRowProps) {
  const crossesMidnight =
    dateKeyInBerlin(entry.endTime) !== dateKeyInBerlin(entry.startTime)

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 py-2 text-sm",
        !showActivity && "pl-4"
      )}
    >
      {showActivity && (
        <span className="min-w-0 flex-1 truncate font-medium">
          {entry.activity}
        </span>
      )}
      <span
        className={cn(
          "shrink-0 tabular-nums text-muted-foreground",
          !showActivity && "min-w-0 flex-1 truncate"
        )}
      >
        {formatTimeBerlin(entry.startTime)}–{formatTimeBerlin(entry.endTime)}
        {crossesMidnight && (
          <span className="ml-1 text-xs">({formatShortDateBerlin(entry.endTime)})</span>
        )}
      </span>
      <Badge variant="outline" className="shrink-0 tabular-nums">
        {formatDurationMs(entry.durationMs)}
      </Badge>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Bearbeiten"
          onClick={() => onEdit(entry)}
        >
          <PencilIcon />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          aria-label="Löschen"
          onClick={() => onDelete(entry)}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  )
}
