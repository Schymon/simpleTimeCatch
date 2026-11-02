"use client"

import { useState } from "react"

import { ActivityCombobox } from "@/components/activity-combobox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  fromDatetimeLocalValue,
  isEndBeforeStart,
  toDatetimeLocalValue,
} from "@/lib/time"
import type { TimeEntry } from "@/lib/types"

interface EditEntryDialogProps {
  entry: TimeEntry | null
  activitySuggestions: string[]
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    id: string,
    data: { activity: string; startTimeIso: string; endTimeIso: string }
  ) => void
}

export function EditEntryDialog({
  entry,
  activitySuggestions,
  submitting,
  onOpenChange,
  onSubmit,
}: EditEntryDialogProps) {
  return (
    <Dialog open={entry !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eintrag bearbeiten</DialogTitle>
          <DialogDescription>
            Tätigkeit sowie Start- und Endzeit anpassen.
          </DialogDescription>
        </DialogHeader>
        {/* Radix unmountet DialogContent (und damit dieses Formular) beim
            Schließen und mountet es beim nächsten Öffnen frisch neu – daher
            genügt hier ein einfacher useState-Initialwert statt eines
            Effekts, der bei jedem neuen `entry` zurücksetzt. */}
        {entry && (
          <EditForm
            entry={entry}
            activitySuggestions={activitySuggestions}
            submitting={submitting}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EditForm({
  entry,
  activitySuggestions,
  submitting,
  onSubmit,
}: {
  entry: TimeEntry
  activitySuggestions: string[]
  submitting: boolean
  onSubmit: EditEntryDialogProps["onSubmit"]
}) {
  const [activity, setActivity] = useState(entry.activity)
  const [startLocal, setStartLocal] = useState(() =>
    toDatetimeLocalValue(entry.startTime)
  )
  const [endLocal, setEndLocal] = useState(() => toDatetimeLocalValue(entry.endTime))
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activity.trim()) {
      setError("Bitte eine Tätigkeit angeben.")
      return
    }
    if (!startLocal || !endLocal) {
      setError("Bitte Start- und Endzeit angeben.")
      return
    }
    const startTimeIso = fromDatetimeLocalValue(startLocal)
    const endTimeIso = fromDatetimeLocalValue(endLocal)
    if (isEndBeforeStart(startTimeIso, endTimeIso)) {
      setError("Die Endzeit muss nach der Startzeit liegen.")
      return
    }
    setError(null)
    onSubmit(entry.id, { activity: activity.trim(), startTimeIso, endTimeIso })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-activity">Tätigkeit</Label>
        <ActivityCombobox
          id="edit-activity"
          value={activity}
          onChange={setActivity}
          suggestions={activitySuggestions}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-start">Start (Datum & Uhrzeit)</Label>
        <input
          id="edit-start"
          type="datetime-local"
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-end">Ende (Datum & Uhrzeit)</Label>
        <input
          id="edit-end"
          type="datetime-local"
          value={endLocal}
          onChange={(e) => setEndLocal(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Speichern…" : "Speichern"}
        </Button>
      </DialogFooter>
    </form>
  )
}
