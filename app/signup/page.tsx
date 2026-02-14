"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GraduationCap } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/plan` },
      })
      if (error) {
        setMessage({ type: "error", text: error.message })
        setLoading(false)
        return
      }
      setMessage({
        type: "success",
        text: "Check your email for the confirmation link, then sign in.",
      })
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
            <h1 className="text-2xl font-semibold">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Save and revisit your plans anytime
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
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
                autoComplete="new-password"
                minLength={6}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
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
              {loading ? "Creating account…" : "Sign up"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
