"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, GraduationCap, Calculator, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

interface FeesCalculatorProps {
  fees: {
    estimatedAnnualFee: number
    estimatedTotalFee: number
    hecsHelp: {
      available: boolean
      repaymentThreshold: number
      estimatedRepayment: string
    }
    upfrontPayment: {
      discount: string
      amount: string
    }
    byUniversity: Array<{
      university: string
      faculty: string
      estimatedAnnualFee: number
      courseYears: number
      estimatedTotalFee: number
      isPrimary: boolean
      isPrimaryUniversity: boolean
      facultyUrl?: string
    }>
  }
  userData: any
}

export function FeesCalculator({ fees, userData }: FeesCalculatorProps) {
  // Extract primary university's primary faculty for big summary
  const primarySummaryEntry = fees.byUniversity.find(
    (entry) => entry.isPrimary && entry.isPrimaryUniversity
  )

  // Group all other entries by university (excluding primary summary)
  const otherEntries = fees.byUniversity.filter(
    (entry) => !(entry.isPrimary && entry.isPrimaryUniversity)
  )

  const groupedByUniversity = otherEntries.reduce(
    (acc, entry) => {
      if (!acc[entry.university]) {
        acc[entry.university] = []
      }
      acc[entry.university].push(entry)
      return acc
    },
    {} as Record<string, typeof fees.byUniversity>
  )

  const [expandedUniversities, setExpandedUniversities] = useState<Set<string>>(new Set())

  const toggleUniversity = (uni: string) => {
    const newExpanded = new Set(expandedUniversities)
    if (newExpanded.has(uni)) {
      newExpanded.delete(uni)
    } else {
      newExpanded.add(uni)
    }
    setExpandedUniversities(newExpanded)
  }

  const renderFeeEntry = (entry: (typeof fees.byUniversity)[0]) => (
    <div
      key={`${entry.university}-${entry.faculty}`}
      className="flex items-center justify-between gap-3 p-3 rounded-lg border"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {entry.faculty && entry.faculty !== "General" ? entry.faculty : entry.university}
        </p>
        <p className="text-sm text-muted-foreground">
          {entry.courseYears} {entry.courseYears === 1 ? "year" : "years"}
        </p>
        {entry.facultyUrl && (
          <a
            href={entry.facultyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-foreground hover:underline mt-1"
          >
            Learn more <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold">
          ${entry.estimatedAnnualFee.toLocaleString()}/year
        </p>
        <p className="text-sm text-muted-foreground">
          Total: ${entry.estimatedTotalFee.toLocaleString()}
        </p>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fees & HELP Loan Calculator</CardTitle>
        <CardDescription>
          Estimated course fees and HECS-HELP loan information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Summary - Big Display */}
        {primarySummaryEntry && (
          <div className="p-6 rounded-lg border-2 border-lime/40 bg-lime/10">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Primary Preference</p>
              <p className="text-xl font-bold">
                {primarySummaryEntry.university} - {primarySummaryEntry.faculty}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {primarySummaryEntry.courseYears} {primarySummaryEntry.courseYears === 1 ? "year" : "years"}
              </p>
              {primarySummaryEntry.facultyUrl && (
                <a
                  href={primarySummaryEntry.facultyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-foreground hover:underline mt-2"
                >
                  Learn more about this faculty <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Annual Fee</p>
                <p className="text-2xl font-bold">
                  ${primarySummaryEntry.estimatedAnnualFee.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">
                  ${primarySummaryEntry.estimatedTotalFee.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Estimated Annual Fee</p>
            </div>
            <p className="text-2xl font-bold">${fees.estimatedAnnualFee.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on primary preference</p>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Estimated Total (course duration)</p>
            </div>
            <p className="text-2xl font-bold">${fees.estimatedTotalFee.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on primary preference</p>
          </div>
        </div>

        {/* HECS-HELP */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <h3 className="font-semibold mb-3">HECS-HELP Loan</h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Available: </span>
              <span className="font-medium">
                {fees.hecsHelp.available ? "Yes" : "No"}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Repayment Threshold: </span>
              <span className="font-medium">
                ${fees.hecsHelp.repaymentThreshold.toLocaleString()}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Repayment: </span>
              <span className="font-medium">{fees.hecsHelp.estimatedRepayment}</span>
            </p>
          </div>
        </div>

        {/* Upfront Payment */}
        <div className="p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Upfront Payment Option</h3>
          <p className="text-sm text-muted-foreground mb-2">{fees.upfrontPayment.discount}</p>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-lg font-semibold">${fees.upfrontPayment.amount}</p>
            <p className="text-sm text-muted-foreground">per year (with discount)</p>
          </div>
        </div>

        {/* Other Universities and Faculties - Dropdowns */}
        {Object.keys(groupedByUniversity).length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Other Options</h3>
            <div className="space-y-3">
              {Object.entries(groupedByUniversity).map(([university, entries]) => (
                <Collapsible
                  key={university}
                  open={expandedUniversities.has(university)}
                  onOpenChange={() => toggleUniversity(university)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="font-medium">{university}</span>
                      {expandedUniversities.has(university) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {entries.map((entry) => renderFeeEntry(entry))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
