"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ResultsDashboard } from "../components/results-dashboard"
import { Loader2 } from "lucide-react"

export default function PlanByIdPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : null
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null)
  const [results, setResults] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError("Invalid plan")
      return
    }

    const load = async () => {
      try {
        const planRes = await fetch(`/api/plans/${id}`, { credentials: "include" })
        if (!planRes.ok) {
          if (planRes.status === 401) {
            router.replace(`/login?next=/plan/${id}`)
            return
          }
          if (planRes.status === 404) {
            setError("Plan not found")
            setLoading(false)
            return
          }
          throw new Error("Failed to load plan")
        }
        const plan = await planRes.json()
        const ud = plan.user_data ?? {}
        setUserData(ud)

        const genRes = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ud),
        })
        if (!genRes.ok) throw new Error("Failed to generate plan")
        const planResults = await genRes.json()
        setResults(planResults)
      } catch (e) {
        console.error(e)
        setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    const checkAuth = async () => {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
    load()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !userData || !results) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <p className="text-destructive">{error ?? "Plan not found"}</p>
          <button
            type="button"
            onClick={() => router.push("/plan")}
            className="mt-4 text-sm font-medium text-primary underline underline-offset-4"
          >
            Create a new plan
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  const handleReset = () => router.push("/plan")

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ResultsDashboard
          data={results}
          userData={userData}
          onReset={handleReset}
          planId={id}
          isLoggedIn={isLoggedIn}
        />
      </main>
      <Footer />
    </div>
  )
}
