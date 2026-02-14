"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { YouthAllowanceCalculator } from "./youth-allowance-calculator"
import { RentAssistanceCalculator } from "./rent-assistance-calculator"

interface Benefit {
  name: string
  eligible: boolean
  estimatedAmount?: string
  reason?: string
  nextSteps: string[]
  learnMoreUrl?: string
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
                <div key={index} className="p-4 rounded-lg border-2 border-lime/40 bg-lime/15 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">{benefit.name}</h4>
                    <CheckCircle2 className="h-6 w-6 text-lime shrink-0" />
                  </div>
                  {benefit.estimatedAmount && (
                    <p className="text-base font-medium">
                      <span className="text-foreground">Estimated: </span>
                      <span className="font-bold text-foreground">{benefit.estimatedAmount}</span>
                    </p>
                  )}

                  <Collapsible>
                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg border border-lime/40 bg-muted/30 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
                      Next steps & more
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 pt-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Next Steps:</p>
                          <ul className="space-y-1">
                            {benefit.nextSteps.map((step, stepIndex) => (
                              <li key={stepIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-lime mt-1 font-bold">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-lime bg-lime/10 text-foreground hover:bg-lime-hover hover:border-lime"
                          onClick={() =>
                            window.open(benefit.learnMoreUrl ?? "https://www.servicesaustralia.gov.au", "_blank")
                          }
                        >
                          Learn More
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                        {benefit.name === "Youth Allowance" && benefit.eligible && (
                          <div className="pt-4 border-t border-lime/20">
                            <YouthAllowanceCalculator
                              userData={userData}
                              initialEligible={true}
                              embedded={true}
                            />
                          </div>
                        )}
                        {benefit.name === "Rent Assistance" && benefit.eligible && (
                          <div className="pt-4 border-t border-lime/20">
                            <RentAssistanceCalculator userData={userData} embedded={true} />
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
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
                <div key={index} className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">{benefit.name}</h4>
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                  {benefit.reason && (
                    <p className="text-sm text-muted-foreground">{benefit.reason}</p>
                  )}

                  <Collapsible>
                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
                      Consider & learn more
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 pt-3">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(benefit.learnMoreUrl ?? "https://www.servicesaustralia.gov.au", "_blank")
                          }
                        >
                          Learn More
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
