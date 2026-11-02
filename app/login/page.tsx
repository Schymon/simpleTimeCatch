import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (verifySessionToken(token)) {
    redirect("/")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </main>
  )
}
