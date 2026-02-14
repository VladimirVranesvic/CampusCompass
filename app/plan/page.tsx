"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UserForm } from "./components/user-form"
import { ResultsDashboard } from "./components/results-dashboard"

export default function PlanPage() {
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null)
  const [results, setResults] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    check()
  }, [supabase.auth])

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true)
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate plan")
      }
      
      const planResults = await response.json()
      setResults(planResults)
      setUserData(data)
    } catch (error) {
      console.error("Error generating plan:", error)
      alert("Failed to generate your plan. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setUserData(null)
  }

  const handleSavePlan = (savedPlanId: string) => {
    router.push(`/plan/${savedPlanId}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {results ? (
          <ResultsDashboard 
            data={results} 
            userData={userData} 
            onReset={handleReset}
            isLoggedIn={isLoggedIn}
            onSavePlan={handleSavePlan}
          />
        ) : (
          <UserForm onSubmit={handleSubmit} loading={loading} />
        )}
      </main>
      <Footer />
    </div>
  )
}
