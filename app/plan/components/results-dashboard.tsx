"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Download, Save, Loader2 } from "lucide-react"
import { UACTimeline } from "./uac-timeline"
import { CommutePlanner } from "./commute-planner"
import { RentEstimator } from "./rent-estimator"
import { BenefitsTriage } from "./benefits-triage"
import { FeesCalculator } from "./fees-calculator"
import { PersonalizedChecklist } from "./personalized-checklist"

interface ResultsDashboardProps {
  data: Record<string, unknown>
  userData: Record<string, unknown>
  onReset: () => void
  planId?: string | null
  isLoggedIn?: boolean
  onSavePlan?: (savedPlanId: string) => void
}

export function ResultsDashboard({
  data,
  userData,
  onReset,
  planId,
  isLoggedIn,
  onSavePlan,
}: ResultsDashboardProps) {
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [saveLoading, setSaveLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  const handleSaveNew = async () => {
    if (!onSavePlan || !saveName.trim()) return
    setSaveLoading(true)
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: saveName.trim(), user_data: userData }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to save plan")
      }
      const saved = await res.json()
      setSaveOpen(false)
      setSaveName("")
      onSavePlan(saved.id)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save plan")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!planId) return
    setUpdateLoading(true)
    try {
      const res = await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_data: userData }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to update plan")
      }
      setUpdateLoading(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update plan")
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    <div className="bg-background">
      {/* Header */}
      <section className="bg-sage py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Your Personalized Plan
              </h1>
              <p className="mt-2 text-muted-foreground">
                Everything you need for your uni journey, all in one place
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={onReset}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start Over
              </Button>
              {isLoggedIn && !planId && onSavePlan && (
                <Button variant="outline" onClick={() => setSaveOpen(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save plan
                </Button>
              )}
              {isLoggedIn && planId && (
                <Button
                  variant="outline"
                  onClick={handleUpdate}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Update plan
                </Button>
              )}
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Save plan dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save plan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="plan-name">Plan name</Label>
            <Input
              id="plan-name"
              placeholder="e.g. Sydney 2026"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveNew()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-lime text-foreground hover:bg-lime-hover"
              onClick={handleSaveNew}
              disabled={saveLoading || !saveName.trim()}
            >
              {saveLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {data.checklist && (
          <PersonalizedChecklist checklist={data.checklist} userData={userData} />
        )}

        {data.uacTimeline && (
          <UACTimeline timeline={data.uacTimeline} />
        )}

        {data.commuteData && (
          <CommutePlanner commuteData={data.commuteData} userData={userData} />
        )}

        {data.rentalData && (
          <RentEstimator rentalData={data.rentalData} userData={userData} />
        )}

        {data.benefitsEligibility && (
          <BenefitsTriage benefits={data.benefitsEligibility} userData={userData} />
        )}

        {data.feesEstimate && (
          <FeesCalculator fees={data.feesEstimate} userData={userData} />
        )}
      </div>
    </div>
  )
}
