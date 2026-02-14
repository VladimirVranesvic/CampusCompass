"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, FileText, Trash2, Loader2 } from "lucide-react"

interface PlanRow {
  id: string
  name: string
  user_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) {
        router.replace("/login?next=/plans")
        return
      }
      setUser(u)
      const res = await fetch("/api/plans", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
      setLoading(false)
    }
    init()
  }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan? This can't be undone.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE", credentials: "include" })
      if (res.ok) {
        setPlans((p) => p.filter((x) => x.id !== id))
      }
    } finally {
      setDeletingId(null)
    }
  }

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

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My plans</h1>
              <p className="mt-1 text-muted-foreground">
                Open a saved plan or create a new one
              </p>
            </div>
            <Button className="bg-lime text-foreground hover:bg-lime-hover" asChild>
              <Link href="/plan">
                <GraduationCap className="mr-2 h-4 w-4" />
                New plan
              </Link>
            </Button>
          </div>

          {plans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No saved plans yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a plan and use &quot;Save plan&quot; to see it here
                </p>
                <Button className="mt-6 bg-lime text-foreground hover:bg-lime-hover" asChild>
                  <Link href="/plan">Create your first plan</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-3">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-lg">{plan.name}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Updated {format(new Date(plan.updated_at), "d MMM yyyy")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/plan/${plan.id}`}>Open</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(plan.id)}
                          disabled={deletingId === plan.id}
                          aria-label="Delete plan"
                        >
                          {deletingId === plan.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

