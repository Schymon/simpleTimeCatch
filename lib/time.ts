import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz"
import { de } from "date-fns/locale"

import type { RunningTimer } from "@/lib/types"

/**
 * Feste Zeitzone für die gesamte App (siehe Konzept, Abschnitt 1 & 5).
 * Alle Anzeigen, Eingaben und Gruppierungs-Schlüssel werden unabhängig von
 * der Server-Zeitzone immer in Europe/Berlin interpretiert/formatiert.
 */
export const APP_TIME_ZONE = "Europe/Berlin"

/** Aktueller Zeitpunkt als ISO-Datetime-String (UTC-Instant). */
export function nowIso(): string {
  return new Date().toISOString()
}

/** Tages-Schlüssel (YYYY-MM-DD) in Europe/Berlin – Grundlage für Tages-Gruppierung. */
export function dateKeyInBerlin(iso: string): string {
  return formatInTimeZone(new Date(iso), APP_TIME_ZONE, "yyyy-MM-dd")
}

/** z. B. "Mittwoch, 13. August 2026" – für die reine Datumsanzeige im oberen Panel. */
export function formatWeekdayDateBerlin(iso: string): string {
  return formatInTimeZone(new Date(iso), APP_TIME_ZONE, "EEEE, d. MMMM yyyy", {
    locale: de,
  })
}

/** z. B. "Mi, 13.08.2026" – kompakter Tages-Header über den Listeneinträgen. */
export function formatDaySectionHeader(dateKey: string): string {
  // dateKey ist bereits ein reiner Kalendertag (YYYY-MM-DD) ohne Uhrzeit/Zone,
  // daher hier bewusst ohne erneute Zeitzonen-Konvertierung geparst.
  const [year, month, day] = dateKey.split("-").map(Number)
  const noon = new Date(Date.UTC(year, month - 1, day, 12))
  return formatInTimeZone(noon, "UTC", "EEEEEE, dd.MM.yyyy", {
    locale: de,
  })
}

/** z. B. "08:00" */
export function formatTimeBerlin(iso: string): string {
  return formatInTimeZone(new Date(iso), APP_TIME_ZONE, "HH:mm")
}

/** z. B. "13.08.2026" */
export function formatDateBerlin(iso: string): string {
  return formatInTimeZone(new Date(iso), APP_TIME_ZONE, "dd.MM.yyyy")
}

/** z. B. "13.08." – kompakter Zusatz, wenn ein Eintrag über Mitternacht geht. */
export function formatShortDateBerlin(iso: string): string {
  return formatInTimeZone(new Date(iso), APP_TIME_ZONE, "dd.MM.")
}

/** Wert für <input type="datetime-local">, interpretiert in Europe/Berlin. */
export function toDatetimeLocalValue(iso: string): string {
  const zoned = toZonedTime(new Date(iso), APP_TIME_ZONE)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${zoned.getFullYear()}-${pad(zoned.getMonth() + 1)}-${pad(zoned.getDate())}T${pad(zoned.getHours())}:${pad(zoned.getMinutes())}`
}

/** Kehrt toDatetimeLocalValue um: datetime-local-Wert (Berlin-Lokalzeit) -> ISO-Instant. */
export function fromDatetimeLocalValue(value: string): string {
  return fromZonedTime(value, APP_TIME_ZONE).toISOString()
}

/**
 * Prüft "Ende vor Start?" auf Minuten-Genauigkeit statt exakt auf die
 * Millisekunde. Die `datetime-local`-Felder für Start/Ende erlauben nur
 * Minuten-Auswahl, während z. B. die Startzeit eines Timers sekundengenau
 * ist – ohne diese Toleranz würde ein Stop in derselben Minute wie der
 * Start (nach dem Abrunden auf :00 Sekunden) fälschlich als "vor dem Start"
 * abgelehnt.
 */
export function isEndBeforeStart(startIso: string, endIso: string): boolean {
  const floorToMinuteMs = (iso: string) => {
    const ms = new Date(iso).getTime()
    return ms - (ms % 60000)
  }
  return floorToMinuteMs(endIso) < floorToMinuteMs(startIso)
}

/** ms -> "1h 30m" / "45m" / "0m", für Dauer-Badges. */
export function formatDurationMs(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

/** Verstrichene Zeit (ms) eines laufenden Timers zu einem gegebenen Zeitpunkt, abzüglich Pausen. */
export function computeElapsedMs(running: RunningTimer, nowMs: number): number {
  const start = new Date(running.startTime).getTime()
  let elapsed = nowMs - start - running.accumulatedPauseMs
  if (running.isPaused && running.pauseStartedAt) {
    elapsed -= nowMs - new Date(running.pauseStartedAt).getTime()
  }
  return Math.max(0, elapsed)
}

/** ms -> "01:24:37", für die laufende Stoppuhr-Anzeige. */
export function formatStopwatch(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}
