import { NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth"

// Alle Routen sind geschützt außer /login und /api/login (siehe Konzept, Abschnitt 4).
// Proxy (Nachfolger von Middleware in Next.js 16) läuft immer auf Node.js,
// daher funktioniert lib/auth.ts (Node `crypto`) hier ohne weitere Konfiguration.
export const config = {
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico).*)"],
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const isValid = verifySessionToken(token)

  if (isValid) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 })
  }

  const loginUrl = new URL("/login", request.url)
  return NextResponse.redirect(loginUrl)
}
