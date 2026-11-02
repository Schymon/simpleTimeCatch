import { NextRequest, NextResponse } from "next/server"

import { createEntry, getEntries } from "@/lib/storage"
import { isEndBeforeStart } from "@/lib/time"

export async function GET() {
  const entries = await getEntries()
  return NextResponse.json({ entries })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  const activity = typeof body?.activity === "string" ? body.activity.trim() : ""
  const startTime = typeof body?.startTime === "string" ? body.startTime : ""
  const endTime = typeof body?.endTime === "string" ? body.endTime : ""
  const pausedMs = typeof body?.pausedMs === "number" ? body.pausedMs : 0

  if (!activity) {
    return NextResponse.json({ error: "Tätigkeit fehlt." }, { status: 400 })
  }
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json(
      { error: "Ungültige Start- oder Endzeit." },
      { status: 400 }
    )
  }
  if (isEndBeforeStart(start.toISOString(), end.toISOString())) {
    return NextResponse.json(
      { error: "Die Endzeit muss nach der Startzeit liegen." },
      { status: 400 }
    )
  }

  const entry = await createEntry({
    activity,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    pausedMs: Math.max(0, pausedMs),
  })
  return NextResponse.json({ entry }, { status: 201 })
}
