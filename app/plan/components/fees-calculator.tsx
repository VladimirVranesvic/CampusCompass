"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from "lucide-react"
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
    unavailableFacultiesWarnings?: Array<{
      university: string
      unavailableFaculties: string[]
      availableFaculties: string[]
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
      className="flex items-center justify-between gap-3 p-4 rounded-lg border-2 border-lime/40 bg-background"
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
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-md border border-border bg-background text-foreground hover:underline"
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
        <CardTitle>Course Preferences and Information</CardTitle>
        <CardDescription>
          Estimated course fees and HECS-HELP loan information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Summary - Big Display */}
        {primarySummaryEntry && (
          <div className="p-6 rounded-lg border-2 border-lime/40 bg-sage/50">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Primary Preference</p>
              <p className="text-xl font-bold">
                {primarySummaryEntry.university} - {primarySummaryEntry.faculty}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {primarySummaryEntry.courseYears} {primarySummaryEntry.courseYears === 1 ? "year" : "years"}
              </p>
              {primarySummaryEntry.facultyUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-lime bg-lime/20 text-foreground hover:bg-lime-hover hover:border-lime"
                  asChild
                >
                  <a
                    href={primarySummaryEntry.facultyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    Learn more about this faculty <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Annual Fee</p>
                <p className="text-2xl font-bold">
                  ${primarySummaryEntry.estimatedAnnualFee.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Total (course duration)</p>
                <p className="text-2xl font-bold">
                  ${primarySummaryEntry.estimatedTotalFee.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

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
          <Button
            variant="outline"
            size="sm"
            className="mt-3 bg-background/80 border-border text-foreground hover:bg-muted/50"
            asChild
          >
            <a
              href="https://www.studyassist.gov.au/help-loans/hecs-help"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              Learn more <ExternalLink className="size-3" />
            </a>
          </Button>
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

        {/* Warnings for Unavailable Faculties */}
        {fees.unavailableFacultiesWarnings && fees.unavailableFacultiesWarnings.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Important Notice</h3>
            <div className="space-y-3">
              {fees.unavailableFacultiesWarnings.map((warning, index) => (
                <div
                  key={`warning-${index}`}
                  className="p-4 rounded-lg border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                        {warning.university}
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                        {warning.unavailableFaculties.length === warning.unavailableFaculties.length &&
                        warning.unavailableFaculties.length === 1 ? (
                          <>
                            <strong>{warning.unavailableFaculties[0]}</strong> is not offered at this university.
                          </>
                        ) : (
                          <>
                            The following fields are <strong>not offered</strong> at this university:{" "}
                            <strong>{warning.unavailableFaculties.join(", ")}</strong>.
                          </>
                        )}
                      </p>
                      {warning.availableFaculties.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                            Available fields at {warning.university}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {warning.availableFaculties.map((faculty) => (
                              <span
                                key={faculty}
                                className="px-2 py-1 text-xs rounded-md bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700"
                              >
                                {faculty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
