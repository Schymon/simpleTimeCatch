import { NextResponse } from "next/server"

import { getRunningTimer, startRunningTimer } from "@/lib/storage"

export async function POST() {
  const existing = await getRunningTimer()
  if (existing) {
    return NextResponse.json(
      { error: "Es läuft bereits eine Zeiterfassung." },
      { status: 409 }
    )
  }
  const running = await startRunningTimer()
  return NextResponse.json({ running }, { status: 201 })
}
