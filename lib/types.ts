// Gemeinsame Datentypen für Client- und Server-Code (siehe konzept.md, Abschnitt 5).
// Bewusst getrennt von lib/storage.ts, das Node-APIs (fs) nutzt und daher
// nicht in Client Components importiert werden darf.

export interface TimeEntry {
  id: string
  activity: string
  /** Kalendertag des Starts in Europe/Berlin, "YYYY-MM-DD" (Gruppierungs-Basis). */
  date: string
  /** ISO-Datetime (UTC-Instant) */
  startTime: string
  /** ISO-Datetime (UTC-Instant) */
  endTime: string
  /** Während der Aufzeichnung pausierte Zeit, in ms. */
  pausedMs: number
  /** (endTime - startTime) - pausedMs, in ms. */
  durationMs: number
}

export interface RunningTimer {
  /** ISO-Datetime (UTC-Instant) */
  startTime: string
  isPaused: boolean
  /** ISO-Datetime (UTC-Instant), gesetzt während einer laufenden Pause. */
  pauseStartedAt: string | null
  /** Summe bereits beendeter Pausen, in ms. */
  accumulatedPauseMs: number
}
