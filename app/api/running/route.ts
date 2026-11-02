import { NextResponse } from "next/server"

import { clearRunningTimer, getRunningTimer } from "@/lib/storage"

export async function GET() {
  const running = await getRunningTimer()
  return NextResponse.json({ running })
}

export async function DELETE() {
  await clearRunningTimer()
  return NextResponse.json({ ok: true })
}
