"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, GraduationCap, Calculator, ChevronDown, ChevronUp } from "lucide-react"
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
    }>
  }
  userData: any
}

export function FeesCalculator({ fees, userData }: FeesCalculatorProps) {
  // Group entries by university
  const groupedByUniversity = fees.byUniversity.reduce(
    (acc, entry) => {
      if (!acc[entry.university]) {
        acc[entry.university] = { primary: [], others: [] }
      }
      if (entry.isPrimary) {
        acc[entry.university].primary.push(entry)
      } else {
        acc[entry.university].others.push(entry)
      }
      return acc
    },
    {} as Record<
      string,
      {
        primary: typeof fees.byUniversity
        others: typeof fees.byUniversity
      }
    >
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
      className={`flex items-center justify-between p-3 rounded-lg border ${
        entry.isPrimary ? "border-lime/40 bg-lime/10" : ""
      }`}
    >
      <div>
        <p className="font-medium">
          {entry.university}
          {entry.faculty && entry.faculty !== "General" && (
            <span className="text-muted-foreground"> - {entry.faculty}</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {entry.courseYears} {entry.courseYears === 1 ? "year" : "years"}
          {entry.isPrimary && (
            <span className="ml-2 text-lime font-medium">(Primary preference)</span>
          )}
        </p>
      </div>
      <div className="text-right">
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
        {/* Summary */}
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

        {/* By University */}
        <div>
          <h3 className="font-semibold mb-3">Estimated Fees by University</h3>
          <div className="space-y-3">
            {Object.entries(groupedByUniversity).map(([university, { primary, others }]) => (
              <div key={university} className="space-y-2">
                {/* Primary preferences (always shown) */}
                {primary.map((entry) => renderFeeEntry(entry))}

                {/* Other preferences (collapsible) */}
                {others.length > 0 && (
                  <Collapsible
                    open={expandedUniversities.has(university)}
                    onOpenChange={() => toggleUniversity(university)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-sm text-muted-foreground hover:text-foreground"
                      >
                        <span>
                          View other preferences ({others.length})
                        </span>
                        {expandedUniversities.has(university) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      {others.map((entry) => renderFeeEntry(entry))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
