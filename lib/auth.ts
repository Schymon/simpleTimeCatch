import { createHmac, timingSafeEqual } from "crypto"

export const SESSION_COOKIE_NAME = "stc_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 Tage

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      "SESSION_SECRET ist nicht gesetzt. Bitte in .env.local konfigurieren."
    )
  }
  return secret
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex")
}

/** Prüft das eingegebene Passwort gegen APP_PASSWORD (zeitkonstanter Vergleich). */
export function verifyPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD
  if (!expected) {
    throw new Error(
      "APP_PASSWORD ist nicht gesetzt. Bitte in .env.local konfigurieren."
    )
  }
  const inputBuf = Buffer.from(input)
  const expectedBuf = Buffer.from(expected)
  if (inputBuf.length !== expectedBuf.length) {
    // Trotzdem einen Vergleich ausführen, um keine Längeninfo per Timing zu leaken.
    timingSafeEqual(inputBuf, inputBuf)
    return false
  }
  return timingSafeEqual(inputBuf, expectedBuf)
}

/** Erstellt ein signiertes, zeitlich begrenztes Session-Token für das Cookie. */
export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = String(expiresAt)
  const signature = sign(payload)
  return `${payload}.${signature}`
}

/** Prüft Signatur und Ablaufzeit eines Session-Tokens aus dem Cookie. */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false
  const [payload, signature] = token.split(".")
  if (!payload || !signature) return false

  const expectedSignature = sign(payload)
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expectedSignature)
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return false
  }

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false

  return true
}

/**
 * Cookie-Optionen abhängig von der tatsächlichen Verbindung (nicht von
 * NODE_ENV): Ein `Secure`-Cookie wird von Browsern über einfaches HTTP
 * verworfen – außer bei `localhost`, das als vertrauenswürdig gilt. Da diese
 * App typischerweise per LAN-IP ohne TLS aufgerufen wird (siehe konzept.md,
 * Abschnitt 1: eigener Server/NAS/Docker), würde ein hart auf
 * `NODE_ENV === "production"` gesetztes `secure: true` den Login dort
 * stillschweigend brechen (Request ok, Cookie wird nie gespeichert). Hinter
 * einem TLS-terminierenden Reverse-Proxy (der `x-forwarded-proto: https`
 * setzt) wird weiterhin korrekt `secure: true` verwendet.
 */
export function getSessionCookieOptions(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const isHttps = forwardedProto
    ? forwardedProto === "https"
    : new URL(request.url).protocol === "https:"

  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}
