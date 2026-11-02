import { NextRequest, NextResponse } from "next/server"

import { deleteEntry, updateEntry } from "@/lib/storage"
import { isEndBeforeStart } from "@/lib/time"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => null)

  const activity = typeof body?.activity === "string" ? body.activity.trim() : ""
  const startTime = typeof body?.startTime === "string" ? body.startTime : ""
  const endTime = typeof body?.endTime === "string" ? body.endTime : ""

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

  const updated = await updateEntry(id, {
    activity,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  })
  if (!updated) {
    return NextResponse.json(
      { error: "Eintrag nicht gefunden." },
      { status: 404 }
    )
  }
  return NextResponse.json({ entry: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = await deleteEntry(id)
  if (!deleted) {
    return NextResponse.json(
      { error: "Eintrag nicht gefunden." },
      { status: 404 }
    )
  }
  return NextResponse.json({ ok: true })
}
