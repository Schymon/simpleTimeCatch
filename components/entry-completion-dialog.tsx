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

interface EntryCompletionDialogProps {
  open: boolean
  startTime: string
  defaultEndTime: string
  activitySuggestions: string[]
  submitting: boolean
  onCancel: () => void
  onSubmit: (data: { activity: string; endTimeIso: string }) => void
}

export function EntryCompletionDialog({
  open,
  startTime,
  defaultEndTime,
  activitySuggestions,
  submitting,
  onCancel,
  onSubmit,
}: EntryCompletionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eintrag abschließen</DialogTitle>
          <DialogDescription>
            Trage die Tätigkeit ein. Die Endzeit ist vorausgefüllt, kann aber
            angepasst werden – z. B. wenn du das Stoppen vergessen hast.
          </DialogDescription>
        </DialogHeader>
        {/* Über den Aufrufer per key={completionCycle} bei jedem Öffnen neu
            gemountet, damit die Felder frisch starten (siehe Kommentar in
            time-tracker-app.tsx) statt sie per Effekt zurückzusetzen. */}
        <CompletionForm
          startTime={startTime}
          defaultEndTime={defaultEndTime}
          activitySuggestions={activitySuggestions}
          submitting={submitting}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function CompletionForm({
  startTime,
  defaultEndTime,
  activitySuggestions,
  submitting,
  onSubmit,
}: Omit<EntryCompletionDialogProps, "open" | "onCancel">) {
  const [activity, setActivity] = useState("")
  const [endLocal, setEndLocal] = useState(() => toDatetimeLocalValue(defaultEndTime))
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activity.trim()) {
      setError("Bitte eine Tätigkeit angeben.")
      return
    }
    if (!endLocal) {
      setError("Bitte eine Endzeit angeben.")
      return
    }
    const endTimeIso = fromDatetimeLocalValue(endLocal)
    if (isEndBeforeStart(startTime, endTimeIso)) {
      setError("Die Endzeit darf nicht vor der Startzeit liegen.")
      return
    }
    setError(null)
    onSubmit({ activity: activity.trim(), endTimeIso })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="completion-activity">Tätigkeit</Label>
        <ActivityCombobox
          id="completion-activity"
          value={activity}
          onChange={setActivity}
          suggestions={activitySuggestions}
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="completion-end">Ende (Datum & Uhrzeit)</Label>
        <input
          id="completion-end"
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
