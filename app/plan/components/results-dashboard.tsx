"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import { UACTimeline } from "./uac-timeline"
import { CommutePlanner } from "./commute-planner"
import { RentEstimator } from "./rent-estimator"
import { BenefitsTriage } from "./benefits-triage"
import { FeesCalculator } from "./fees-calculator"
import { PersonalizedChecklist } from "./personalized-checklist"

interface ResultsDashboardProps {
  data: any
  userData: any
  onReset: () => void
}

export function ResultsDashboard({ data, userData, onReset }: ResultsDashboardProps) {
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
            <div className="flex gap-3">
              <Button variant="outline" onClick={onReset}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start Over
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Personalized Checklist */}
        {data.checklist && (
          <PersonalizedChecklist checklist={data.checklist} userData={userData} />
        )}

        {/* UAC Timeline */}
        {data.uacTimeline && (
          <UACTimeline timeline={data.uacTimeline} />
        )}

        {/* Commute Planner */}
        {data.commuteData && (
          <CommutePlanner commuteData={data.commuteData} userData={userData} />
        )}

        {/* Rent Estimator */}
        {data.rentalData && (
          <RentEstimator rentalData={data.rentalData} userData={userData} />
        )}

        {/* Benefits Triage */}
        {data.benefitsEligibility && (
          <BenefitsTriage benefits={data.benefitsEligibility} userData={userData} />
        )}

        {/* Fees Calculator */}
        {data.feesEstimate && (
          <FeesCalculator fees={data.feesEstimate} userData={userData} />
        )}
      </div>
    </div>
  )
}
