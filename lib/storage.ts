import { randomUUID } from "crypto"
import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

import { dateKeyInBerlin } from "@/lib/time"
import type { RunningTimer, TimeEntry } from "@/lib/types"

export type { RunningTimer, TimeEntry }

const DATA_DIR = path.join(process.cwd(), "data")
const ENTRIES_FILE = path.join(DATA_DIR, "entries.json")
const RUNNING_FILE = path.join(DATA_DIR, "running.json")

// Sehr einfache In-Memory-Warteschlange, die Schreibzugriffe auf dieselbe
// Datei serialisiert. Reicht für die erwartete Nutzung durch eine einzelne
// Person mit seltenen Einträgen (siehe Konzept, Abschnitt 11).
let writeQueue: Promise<unknown> = Promise.resolve()
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task)
  writeQueue = result.catch(() => undefined)
  return result
}

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, "utf-8")
    return JSON.parse(raw) as T
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback
    throw err
  }
}

async function writeJsonFile(file: string, data: unknown) {
  await ensureDataDir()
  await writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf-8")
}

export async function getEntries(): Promise<TimeEntry[]> {
  const entries = await readJsonFile<TimeEntry[]>(ENTRIES_FILE, [])
  // Neueste zuerst (nach Startzeit).
  return [...entries].sort((a, b) => b.startTime.localeCompare(a.startTime))
}

export interface CreateEntryInput {
  activity: string
  startTime: string
  endTime: string
  pausedMs: number
}

export async function createEntry(input: CreateEntryInput): Promise<TimeEntry> {
  return enqueue(async () => {
    const entries = await readJsonFile<TimeEntry[]>(ENTRIES_FILE, [])
    const durationMs = Math.max(
      0,
      new Date(input.endTime).getTime() -
        new Date(input.startTime).getTime() -
        input.pausedMs
    )
    const entry: TimeEntry = {
      id: randomUUID(),
      activity: input.activity.trim(),
      date: dateKeyInBerlin(input.startTime),
      startTime: input.startTime,
      endTime: input.endTime,
      pausedMs: input.pausedMs,
      durationMs,
    }
    entries.push(entry)
    await writeJsonFile(ENTRIES_FILE, entries)
    return entry
  })
}

export interface UpdateEntryInput {
  activity: string
  startTime: string
  endTime: string
}

export async function updateEntry(
  id: string,
  input: UpdateEntryInput
): Promise<TimeEntry | null> {
  return enqueue(async () => {
    const entries = await readJsonFile<TimeEntry[]>(ENTRIES_FILE, [])
    const index = entries.findIndex((e) => e.id === id)
    if (index === -1) return null
    const existing = entries[index]
    const durationMs = Math.max(
      0,
      new Date(input.endTime).getTime() -
        new Date(input.startTime).getTime() -
        existing.pausedMs
    )
    const updated: TimeEntry = {
      ...existing,
      activity: input.activity.trim(),
      date: dateKeyInBerlin(input.startTime),
      startTime: input.startTime,
      endTime: input.endTime,
      durationMs,
    }
    entries[index] = updated
    await writeJsonFile(ENTRIES_FILE, entries)
    return updated
  })
}

export async function deleteEntry(id: string): Promise<boolean> {
  return enqueue(async () => {
    const entries = await readJsonFile<TimeEntry[]>(ENTRIES_FILE, [])
    const next = entries.filter((e) => e.id !== id)
    if (next.length === entries.length) return false
    await writeJsonFile(ENTRIES_FILE, next)
    return true
  })
}

export async function getRunningTimer(): Promise<RunningTimer | null> {
  return readJsonFile<RunningTimer | null>(RUNNING_FILE, null)
}

export async function startRunningTimer(): Promise<RunningTimer> {
  return enqueue(async () => {
    const timer: RunningTimer = {
      startTime: new Date().toISOString(),
      isPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    }
    await writeJsonFile(RUNNING_FILE, timer)
    return timer
  })
}

export async function togglePauseRunningTimer(): Promise<RunningTimer | null> {
  return enqueue(async () => {
    const timer = await readJsonFile<RunningTimer | null>(RUNNING_FILE, null)
    if (!timer) return null
    const now = new Date().toISOString()
    let next: RunningTimer
    if (timer.isPaused) {
      const pausedMs = timer.pauseStartedAt
        ? new Date(now).getTime() - new Date(timer.pauseStartedAt).getTime()
        : 0
      next = {
        ...timer,
        isPaused: false,
        pauseStartedAt: null,
        accumulatedPauseMs: timer.accumulatedPauseMs + pausedMs,
      }
    } else {
      next = { ...timer, isPaused: true, pauseStartedAt: now }
    }
    await writeJsonFile(RUNNING_FILE, next)
    return next
  })
}

export async function clearRunningTimer(): Promise<void> {
  await enqueue(async () => {
    await writeJsonFile(RUNNING_FILE, null)
  })
}
