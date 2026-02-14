"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GraduationCap, Loader2 } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/plan"
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: "error", text: error.message })
        setLoading(false)
        return
      }
      router.push(next)
      router.refresh()
    } catch {
      setMessage({ type: "error", text: "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
              <GraduationCap className="h-7 w-7 text-background" />
            </div>
            <h1 className="text-2xl font-semibold">Sign in to CampusCompass</h1>
            <p className="text-sm text-muted-foreground">
              Access your saved plans and continue where you left off
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full"
              />
            </div>
            {message && (
              <p
                className={`text-sm ${
                  message.type === "error" ? "text-destructive" : "text-green-600"
                }`}
              >
                {message.text}
              </p>
            )}
            <Button type="submit" className="w-full bg-lime text-foreground hover:bg-lime-hover" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center px-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
          <Footer />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
