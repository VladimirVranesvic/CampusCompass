"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calculator, ChevronDown, ChevronUp, Info, Home } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  calculateRentAssistance,
  getRentTypeLabel,
  getHouseholdTypeLabel,
  type HouseholdType,
  type RentType,
} from "@/lib/data/rent-assistance-calculator"

interface RentAssistanceCalculatorProps {
  userData?: any
  embedded?: boolean
}

export function RentAssistanceCalculator({ userData, embedded = false }: RentAssistanceCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fortnightlyAmount, setFortnightlyAmount] = useState<string>("")
  const [rentType, setRentType] = useState<RentType>("private")
  const [householdType, setHouseholdType] = useState<HouseholdType>("single_sharer")
  const [basePayment, setBasePayment] = useState<string>("")
  const [personalIncome, setPersonalIncome] = useState<string>("")
  const [result, setResult] = useState<ReturnType<typeof calculateRentAssistance> | null>(null)

  const handleCalculate = () => {
    const amount = parseFloat(fortnightlyAmount)
    if (!Number.isFinite(amount) || amount < 0) {
      return
    }
    const base = basePayment ? parseFloat(basePayment) : undefined
    const income = personalIncome ? parseFloat(personalIncome) : undefined

    const res = calculateRentAssistance({
      fortnightlyAmount: amount,
      rentType,
      householdType,
      basePaymentFortnightly: base,
      personalIncomeFortnightly: income,
    })
    setResult(res)
  }

  const content = (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>{isOpen ? "Hide estimator" : "Estimate Rent Assistance"}</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Rent Assistance is paid on top of Youth Allowance (or Austudy/ABSTUDY) when you pay eligible rent. 
            Not eligible if you live in government housing or at the parental home.
          </p>

          <div>
            <Label>What you pay per fortnight</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Enter your rent or total board/lodging payment per fortnight
            </p>
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 400"
              value={fortnightlyAmount}
              onChange={(e) => setFortnightlyAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Type of payment</Label>
            <Select value={rentType} onValueChange={(v) => setRentType(v as RentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">{getRentTypeLabel("private")}</SelectItem>
                <SelectItem value="board_lodging">{getRentTypeLabel("board_lodging")}</SelectItem>
                <SelectItem value="board_only">{getRentTypeLabel("board_only")}</SelectItem>
              </SelectContent>
            </Select>
            {(rentType === "board_lodging" || rentType === "board_only") && (
              <p className="text-xs text-muted-foreground mt-1">
                {rentType === "board_lodging"
                  ? "We use 2/3 of your payment as eligible rent."
                  : "We use 1/3 of your payment as eligible rent."}
              </p>
            )}
          </div>

          <div>
            <Label>Household type</Label>
            <Select value={householdType} onValueChange={(v) => setHouseholdType(v as HouseholdType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{getHouseholdTypeLabel("single")}</SelectItem>
                <SelectItem value="single_sharer">{getHouseholdTypeLabel("single_sharer")}</SelectItem>
                <SelectItem value="couple">{getHouseholdTypeLabel("couple")}</SelectItem>
              </SelectContent>
            </Select>
            {householdType === "single_sharer" && (
              <p className="text-xs text-muted-foreground mt-1">
                Max Rent Assistance for sharers is $143.60/fortnight (2026).
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Base payment per fortnight (optional)</Label>
              <p className="text-xs text-muted-foreground mb-1">e.g. Youth Allowance amount</p>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 677.20"
                value={basePayment}
                onChange={(e) => setBasePayment(e.target.value)}
              />
            </div>
            <div>
              <Label>Your personal income per fortnight (optional)</Label>
              <p className="text-xs text-muted-foreground mb-1">For income test note</p>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 300"
                value={personalIncome}
                onChange={(e) => setPersonalIncome(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Rent Assistance
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {result && (
        <div className="mt-6 p-4 rounded-lg border-2 border-lime/40 bg-lime/10 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Home className="h-4 w-4" />
            Result
          </h4>
          {result.eligible ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Eligible rent used in calculation</p>
                <p className="text-lg font-semibold">${result.eligibleRent.toFixed(2)} / fortnight</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Threshold: ${result.rentThreshold} → Max rate: ${result.maxRate}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Rent Assistance</p>
                <p className="text-2xl font-bold text-lime">${result.rentAssistanceFortnightly.toFixed(2)} / fortnight</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formula: (Rent − ${result.rentThreshold}) × 75% = ${result.rentAssistanceBeforeCap.toFixed(2)}, capped at ${result.maxRate}
                </p>
              </div>
              {result.warnings.length > 0 && (
                <div className="pt-2 border-t border-lime/20 space-y-1">
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-muted-foreground">No Rent Assistance</p>
              {result.warnings.map((w, i) => (
                <p key={i} className="text-sm text-muted-foreground mt-1">{w}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (embedded) {
    return (
      <div className="mt-4">
        <div className="mb-4">
          <h4 className="font-semibold flex items-center gap-2 mb-1">
            <Calculator className="h-4 w-4" />
            Rent Assistance estimator
          </h4>
          <p className="text-sm text-muted-foreground">
            Estimate how much extra you may get on top of Youth Allowance when you pay rent.
          </p>
        </div>
        {content}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Rent Assistance estimator
        </CardTitle>
        <CardDescription>
          Estimate your Rent Assistance using 2026 thresholds. You must already receive Youth Allowance, Austudy, or ABSTUDY.
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
