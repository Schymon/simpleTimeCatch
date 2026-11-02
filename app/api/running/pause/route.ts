import { NextResponse } from "next/server"

import { togglePauseRunningTimer } from "@/lib/storage"

export async function POST() {
  const running = await togglePauseRunningTimer()
  if (!running) {
    return NextResponse.json(
      { error: "Es läuft aktuell keine Zeiterfassung." },
      { status: 409 }
    )
  }
  return NextResponse.json({ running })
}
