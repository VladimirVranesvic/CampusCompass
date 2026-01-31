"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UserForm } from "./components/user-form"
import { ResultsDashboard } from "./components/results-dashboard"

export default function PlanPage() {
  const [userData, setUserData] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: any) => {
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {results ? (
          <ResultsDashboard 
            data={results} 
            userData={userData} 
            onReset={handleReset}
          />
        ) : (
          <UserForm onSubmit={handleSubmit} loading={loading} />
        )}
      </main>
      <Footer />
    </div>
  )
}
