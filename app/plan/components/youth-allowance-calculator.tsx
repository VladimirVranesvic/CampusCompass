"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calculator, ChevronDown, ChevronUp, Info } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { calculateYouthAllowance, parseHouseholdIncome, parsePersonalIncomeFortnightly } from "@/lib/data/youth-allowance-calculator"

interface YouthAllowanceCalculatorProps {
  userData: any
  initialEligible?: boolean
  embedded?: boolean // If true, don't show outer Card wrapper
}

export function YouthAllowanceCalculator({ userData, initialEligible = false, embedded = false }: YouthAllowanceCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCalculated, setIsCalculated] = useState(false)
  
  // Form state
  const [parentalIncomeAnnual, setParentalIncomeAnnual] = useState<string>("")
  const [siblingsCount, setSiblingsCount] = useState<string>("0")
  const [personalIncomeFortnightly, setPersonalIncomeFortnightly] = useState<string>("")
  const [personalAssets, setPersonalAssets] = useState<string>("")
  const [isHomeowner, setIsHomeowner] = useState<string>("")
  const [independenceStatus, setIndependenceStatus] = useState<string>("")
  const [isPartnered, setIsPartnered] = useState<string>("")
  const [hasDependentChildren, setHasDependentChildren] = useState<string>("")
  
  const [calculationResult, setCalculationResult] = useState<any>(null)
  
  const age = typeof userData.age === 'number' ? userData.age : parseInt(String(userData.age ?? ''), 10)
  const studyLoadFullTime = userData.studyLoadFullTime === "yes"
  const concessionalStudyLoad = userData.concessionalStudyLoad === "yes"
  
  // Determine living situation
  const livingSituationMap: Record<string, "home" | "away" | "renting" | "moving_out" | "on-campus" | "unsure"> = {
    "home": "home",
    "renting": "renting",
    "moving_out": "away",
    "on-campus": "away",
    "unsure": "away",
  }
  const livingSituation = livingSituationMap[userData.livingSituation] || "away"
  
  // Pre-fill from form data if available
  const householdIncomeBand = userData.householdIncome
  const initialParentalIncome = householdIncomeBand && householdIncomeBand !== "prefer-not-to-say"
    ? parseHouseholdIncome(householdIncomeBand)?.toString() || ""
    : ""
  
  const siblingsStr = userData.siblingsReceivingPayments
  const initialSiblings = siblingsStr === "yes-1" ? "1"
    : siblingsStr === "yes-2" ? "2"
    : siblingsStr === "yes-3plus" ? "3"
    : "0"
  
  // Initialize with form data using useEffect
  useEffect(() => {
    if (initialParentalIncome) setParentalIncomeAnnual(initialParentalIncome)
    if (initialSiblings) setSiblingsCount(initialSiblings)
    if (age >= 22) setIndependenceStatus("yes")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleCalculate = () => {
    const parentalIncome = parentalIncomeAnnual ? parseFloat(parentalIncomeAnnual) : undefined
    const siblings = parseInt(siblingsCount) || 0
    const personalIncome = personalIncomeFortnightly ? parseFloat(personalIncomeFortnightly) : undefined
    const assets = personalAssets ? parseFloat(personalAssets) : undefined
    
    const isIndependent = independenceStatus === "yes" || age >= 22
    
    const result = calculateYouthAllowance({
      age,
      studyLoadFullTime,
      concessionalStudyLoad,
      isIndependent,
      independenceReason: independenceStatus === "yes" ? "declared" : age >= 22 ? "age22" : undefined,
      parentalIncomeAnnual: parentalIncome,
      siblingsReceivingPayments: siblings,
      personalIncomeFortnightly: personalIncome,
      personalAssets: assets,
      isHomeowner: isHomeowner === "yes",
      livingSituation,
      hasDependentChildren: hasDependentChildren === "yes",
      isPartnered: isPartnered === "yes",
    })
    
    setCalculationResult(result)
    setIsCalculated(true)
  }
  
  // Basic eligibility check
  const basicEligible = age >= 18 && age <= 24 && (studyLoadFullTime || concessionalStudyLoad)
  
  if (!basicEligible && !initialEligible) {
    return null
  }
  
  const renderCalculatorContent = () => (
    <div className="space-y-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{isOpen ? "Hide Calculator" : "Show Calculator"}</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Independence Status */}
            <div>
              <Label htmlFor="independenceStatus">Are you independent for Youth Allowance purposes?</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                You are independent if you are 22+, married/de facto, have a dependent child, worked full-time for 18 months, or from regional/remote area with sufficient earnings.
              </p>
              <Select value={independenceStatus} onValueChange={setIndependenceStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, I am independent</SelectItem>
                  <SelectItem value="no">No, I am dependent</SelectItem>
                  <SelectItem value="unsure">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Parental Income (for dependent students) */}
            {(independenceStatus === "no" || independenceStatus === "" || age < 22) && (
              <div>
                <Label htmlFor="parentalIncomeAnnual">Parental Income (Annual)</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Combined taxable income of your parents from 2024-25 tax year
                </p>
                <Input
                  id="parentalIncomeAnnual"
                  type="number"
                  placeholder="e.g. 75000"
                  value={parentalIncomeAnnual}
                  onChange={(e) => setParentalIncomeAnnual(e.target.value)}
                />
              </div>
            )}
            
            {/* Siblings Receiving Payments */}
            {(independenceStatus === "no" || independenceStatus === "" || age < 22) && (
              <div>
                <Label htmlFor="siblingsCount">Number of siblings also receiving Youth Allowance/ABSTUDY</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Parental income reduction is shared among all children receiving payments
                </p>
                <Select value={siblingsCount} onValueChange={setSiblingsCount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3 or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Personal Income */}
            <div>
              <Label htmlFor="personalIncomeFortnightly">Your Personal Income (Per Fortnight)</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Gross earnings from work or other allowances per fortnight
              </p>
              <Input
                id="personalIncomeFortnightly"
                type="number"
                placeholder="e.g. 400"
                value={personalIncomeFortnightly}
                onChange={(e) => setPersonalIncomeFortnightly(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Income free area: $539/fortnight. Reductions apply above this amount.
              </p>
            </div>
            
            {/* Personal Assets */}
            <div>
              <Label htmlFor="personalAssets">Total Value of Personal Assets</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Include savings, investments, car value (exclude family home)
              </p>
              <Input
                id="personalAssets"
                type="number"
                placeholder="e.g. 50000"
                value={personalAssets}
                onChange={(e) => setPersonalAssets(e.target.value)}
              />
              <div className="mt-2">
                <Label htmlFor="isHomeowner">Do you own a home?</Label>
                <Select value={isHomeowner} onValueChange={setIsHomeowner}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Asset limits: ${isHomeowner === "yes" ? "321,500" : "579,500"}
                </p>
              </div>
            </div>
            
            {/* Partnered Status */}
            <div>
              <Label htmlFor="isPartnered">Are you partnered (married or de facto)?</Label>
              <Select value={isPartnered} onValueChange={setIsPartnered}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Dependent Children */}
            <div>
              <Label htmlFor="hasDependentChildren">Do you have dependent children?</Label>
              <Select value={hasDependentChildren} onValueChange={setHasDependentChildren}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleCalculate} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Payment
            </Button>
          </CollapsibleContent>
        </Collapsible>
        
        {/* Calculation Results */}
        {isCalculated && calculationResult && (
          <div className="mt-6 p-4 rounded-lg border-2 border-lime/40 bg-lime/10">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Calculation Results
            </h3>
            
            {calculationResult.eligible ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Base Rate</p>
                    <p className="text-2xl font-bold">${calculationResult.baseRate.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per fortnight</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Final Payment</p>
                    <p className="text-2xl font-bold text-lime">${calculationResult.finalFortnightlyPayment.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per fortnight</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-lime/20">
                  <p className="text-sm font-semibold mb-2">Annual Amount</p>
                  <p className="text-xl font-bold">${calculationResult.annualPayment.toFixed(2)}</p>
                </div>
                
                {(calculationResult.parentalIncomeReduction > 0 || calculationResult.personalIncomeReduction > 0) && (
                  <div className="pt-4 border-t border-lime/20 space-y-2">
                    <p className="text-sm font-semibold mb-2">Reductions Applied:</p>
                    {calculationResult.parentalIncomeReduction > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Parental Income Reduction:</span>
                        <span className="font-medium text-red-600">-${calculationResult.parentalIncomeReduction.toFixed(2)}/fortnight</span>
                      </div>
                    )}
                    {calculationResult.personalIncomeReduction > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Personal Income Reduction:</span>
                        <span className="font-medium text-red-600">-${calculationResult.personalIncomeReduction.toFixed(2)}/fortnight</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="pt-4 border-t border-lime/20">
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-medium capitalize">{calculationResult.independenceStatus}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold text-red-600">Not Eligible</p>
                {calculationResult.ineligibleReasons.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {calculationResult.ineligibleReasons.map((reason: string, index: number) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                )}
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
            Payment Calculator
          </h4>
          <p className="text-sm text-muted-foreground">
            Get a detailed estimate based on your specific circumstances
          </p>
        </div>
        {renderCalculatorContent()}
      </div>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Youth Allowance Payment Calculator
        </CardTitle>
        <CardDescription>
          Get a detailed estimate of your Youth Allowance payment based on your specific circumstances
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderCalculatorContent()}
      </CardContent>
    </Card>
  )
}
