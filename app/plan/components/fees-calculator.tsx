"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, GraduationCap, Calculator } from "lucide-react"

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
      estimatedAnnualFee: number
      courseYears: number
      estimatedTotalFee: number
    }>
  }
  userData: any
}

export function FeesCalculator({ fees, userData }: FeesCalculatorProps) {
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
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Estimated Total (course duration)</p>
            </div>
            <p className="text-2xl font-bold">${fees.estimatedTotalFee.toLocaleString()}</p>
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
          <div className="space-y-2">
            {fees.byUniversity.map((uni, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{uni.university}</p>
                  <p className="text-sm text-muted-foreground">
                    {uni.courseYears} {uni.courseYears === 1 ? "year" : "years"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${uni.estimatedAnnualFee.toLocaleString()}/year
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: ${uni.estimatedTotalFee.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
