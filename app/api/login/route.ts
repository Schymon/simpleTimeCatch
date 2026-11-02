import { NextRequest, NextResponse } from "next/server"

import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifyPassword,
} from "@/lib/auth"

export async function POST(request: NextRequest) {
  let password: string
  try {
    const body = await request.json()
    password = typeof body?.password === "string" ? body.password : ""
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 })
  }

  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(
    SESSION_COOKIE_NAME,
    createSessionToken(),
    getSessionCookieOptions(request)
  )
  return response
}
