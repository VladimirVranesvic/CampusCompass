"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Benefit {
  name: string
  eligible: boolean
  estimatedAmount?: string
  reason?: string
  nextSteps: string[]
}

interface BenefitsTriageProps {
  benefits: Benefit[]
  userData: any
}

export function BenefitsTriage({ benefits, userData }: BenefitsTriageProps) {
  const eligibleBenefits = benefits.filter((b) => b.eligible)
  const ineligibleBenefits = benefits.filter((b) => !b.eligible)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benefits & Support Eligibility</CardTitle>
        <CardDescription>
          Government support and concessions you may be eligible for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Eligible Benefits */}
        {eligibleBenefits.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-lime" />
              You May Be Eligible For
            </h3>
            <div className="space-y-4">
              {eligibleBenefits.map((benefit, index) => (
                <div key={index} className="p-4 rounded-lg border border-lime/20 bg-lime/5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{benefit.name}</h4>
                    <CheckCircle2 className="h-5 w-5 text-lime shrink-0" />
                  </div>
                  {benefit.estimatedAmount && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Estimated: {benefit.estimatedAmount}
                    </p>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-2">Next Steps:</p>
                    <ul className="space-y-1">
                      {benefit.nextSteps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-lime mt-1">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      window.open("https://www.servicesaustralia.gov.au", "_blank")
                    }
                  >
                    Learn More
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ineligible Benefits */}
        {ineligibleBenefits.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              May Not Be Eligible
            </h3>
            <div className="space-y-4">
              {ineligibleBenefits.map((benefit, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{benefit.name}</h4>
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                  {benefit.reason && (
                    <p className="text-sm text-muted-foreground mb-3">{benefit.reason}</p>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-2">Consider:</p>
                    <ul className="space-y-1">
                      {benefit.nextSteps.map((step, stepIndex) => (
                        <li
                          key={stepIndex}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <AlertCircle className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
