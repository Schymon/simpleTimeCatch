"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { EditEntryDialog } from "@/components/edit-entry-dialog"
import { EntryCompletionDialog } from "@/components/entry-completion-dialog"
import { EntryList } from "@/components/entry-list"
import { StopConfirmDialog } from "@/components/stop-confirm-dialog"
import { StopwatchPanel } from "@/components/stopwatch-panel"
import { computeElapsedMs, nowIso } from "@/lib/time"
import type { RunningTimer, TimeEntry } from "@/lib/types"

export function TimeTrackerApp() {
  const router = useRouter()

  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [running, setRunning] = useState<RunningTimer | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nowMs, setNowMs] = useState(() => Date.now())
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false)
  const [completionOpen, setCompletionOpen] = useState(false)
  const [frozenElapsedMs, setFrozenElapsedMs] = useState<number | null>(null)
  const [frozenStopIso, setFrozenStopIso] = useState<string | null>(null)
  const [completionSubmitting, setCompletionSubmitting] = useState(false)

  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null)

  // Initial laden: laufender Timer + bisherige Einträge.
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [runningRes, entriesRes] = await Promise.all([
          fetch("/api/running"),
          fetch("/api/entries"),
        ])
        if (cancelled) return
        const runningData = await runningRes.json()
        const entriesData = await entriesRes.json()
        setRunning(runningData.running)
        setEntries(entriesData.entries)
      } catch {
        if (!cancelled) setError("Daten konnten nicht geladen werden.")
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Stoppuhr-Ticker: läuft, solange ein Timer aktiv ist und kein Stop
  // bestätigt wurde. Die Pausen-Berechnung übernimmt computeElapsedMs.
  useEffect(() => {
    if (!running || stopConfirmOpen || completionOpen) return
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running, stopConfirmOpen, completionOpen])

  const elapsedMs = useMemo(() => {
    if (frozenElapsedMs !== null) return frozenElapsedMs
    if (!running) return 0
    return computeElapsedMs(running, nowMs)
  }, [running, nowMs, frozenElapsedMs])

  const activitySuggestions = useMemo(
    () => Array.from(new Set(entries.map((e) => e.activity))),
    [entries]
  )

  const handleStart = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/running/start", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Start fehlgeschlagen.")
      setRunning(data.running)
      setNowMs(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Start fehlgeschlagen.")
    } finally {
      setBusy(false)
    }
  }, [])

  const handlePauseToggle = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/running/pause", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Pause fehlgeschlagen.")
      setRunning(data.running)
      setNowMs(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pause fehlgeschlagen.")
    } finally {
      setBusy(false)
    }
  }, [])

  const handleStopClick = useCallback(() => {
    if (!running) return
    const stopMoment = Date.now()
    setFrozenElapsedMs(computeElapsedMs(running, stopMoment))
    setFrozenStopIso(new Date(stopMoment).toISOString())
    setStopConfirmOpen(true)
  }, [running])

  const resumeAfterStopInterrupted = useCallback(() => {
    setStopConfirmOpen(false)
    setCompletionOpen(false)
    setFrozenElapsedMs(null)
    setFrozenStopIso(null)
    setNowMs(Date.now())
  }, [])

  const handleStopCancel = useCallback(() => {
    resumeAfterStopInterrupted()
  }, [resumeAfterStopInterrupted])

  const handleStopConfirm = useCallback(() => {
    setStopConfirmOpen(false)
    setCompletionOpen(true)
  }, [])

  const handleCompletionCancel = useCallback(() => {
    // Nichts wurde gespeichert, running.json ist unverändert -> Timer läuft weiter.
    resumeAfterStopInterrupted()
  }, [resumeAfterStopInterrupted])

  const handleCompletionSubmit = useCallback(
    async ({ activity, endTimeIso }: { activity: string; endTimeIso: string }) => {
      if (!running) return
      setCompletionSubmitting(true)
      setError(null)
      try {
        const pausedMs =
          running.accumulatedPauseMs +
          (running.isPaused && running.pauseStartedAt
            ? Date.now() - new Date(running.pauseStartedAt).getTime()
            : 0)

        const res = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity,
            startTime: running.startTime,
            endTime: endTimeIso,
            pausedMs,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error ?? "Speichern fehlgeschlagen.")

        await fetch("/api/running", { method: "DELETE" })

        setEntries((prev) => [data.entry, ...prev])
        setRunning(null)
        setCompletionOpen(false)
        setFrozenElapsedMs(null)
        setFrozenStopIso(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.")
      } finally {
        setCompletionSubmitting(false)
      }
    },
    [running]
  )

  const handleEditSubmit = useCallback(
    async (
      id: string,
      data: { activity: string; startTimeIso: string; endTimeIso: string }
    ) => {
      setEditSubmitting(true)
      setError(null)
      try {
        const res = await fetch(`/api/entries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity: data.activity,
            startTime: data.startTimeIso,
            endTime: data.endTimeIso,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error ?? "Speichern fehlgeschlagen.")
        setEntries((prev) => prev.map((e) => (e.id === id ? json.entry : e)))
        setEditingEntry(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.")
      } finally {
        setEditSubmitting(false)
      }
    },
    []
  )

  const handleDeleteConfirm = useCallback(async (id: string) => {
    setError(null)
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? "Löschen fehlgeschlagen.")
      }
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen.")
    } finally {
      setDeletingEntry(null)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" })
    router.replace("/login")
    router.refresh()
  }, [router])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h1 className="text-sm font-medium">Zeiterfassung</h1>
        <Button variant="ghost" size="icon-sm" aria-label="Abmelden" onClick={handleLogout}>
          <LogOutIcon />
        </Button>
      </div>

      <StopwatchPanel
        running={running}
        elapsedMs={elapsedMs}
        busy={busy || !loaded}
        onStart={handleStart}
        onPauseToggle={handlePauseToggle}
        onStop={handleStopClick}
      />

      {error && (
        <p className="px-3 pt-2 text-sm text-destructive">{error}</p>
      )}

      <EntryList
        entries={entries}
        onEdit={setEditingEntry}
        onDelete={setDeletingEntry}
      />

      <StopConfirmDialog
        open={stopConfirmOpen}
        onCancel={handleStopCancel}
        onConfirm={handleStopConfirm}
      />

      {running && (
        <EntryCompletionDialog
          open={completionOpen}
          startTime={running.startTime}
          defaultEndTime={frozenStopIso ?? nowIso()}
          activitySuggestions={activitySuggestions}
          submitting={completionSubmitting}
          onCancel={handleCompletionCancel}
          onSubmit={handleCompletionSubmit}
        />
      )}

      <EditEntryDialog
        entry={editingEntry}
        activitySuggestions={activitySuggestions}
        submitting={editSubmitting}
        onOpenChange={(open) => {
          if (!open) setEditingEntry(null)
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmDialog
        entry={deletingEntry}
        onOpenChange={(open) => {
          if (!open) setDeletingEntry(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
