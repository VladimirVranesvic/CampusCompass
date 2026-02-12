/**
 * Youth Allowance Calculator for NSW Students (2026 thresholds)
 * Implements the complete eligibility and payment calculation logic
 */

export interface YouthAllowanceInput {
  age: number
  studyLoadFullTime: boolean
  concessionalStudyLoad?: boolean
  
  // Independence Status
  isIndependent: boolean
  independenceReason?: string // "age22", "married", "child", "work18months", "regional"
  
  // Parental Income Test (for dependent students)
  parentalIncomeAnnual?: number // Annual taxable income from 2024-25 tax year
  siblingsReceivingPayments?: number // Number of siblings also on student payments
  
  // Personal Income Test
  personalIncomeFortnightly?: number // Gross earnings per fortnight
  
  // Personal Assets Test
  personalAssets?: number // Total assets value
  isHomeowner?: boolean // Whether student owns a home
  
  // Living Situation
  livingSituation: "home" | "away" | "renting" | "moving_out" | "on-campus" | "unsure"
  hasDependentChildren?: boolean
  isPartnered?: boolean
}

export interface YouthAllowanceResult {
  eligible: boolean
  eligibleReasons: string[]
  ineligibleReasons: string[]
  
  // Payment calculation
  baseRate: number // Maximum fortnightly rate before deductions
  parentalIncomeReduction: number
  personalIncomeReduction: number
  finalFortnightlyPayment: number
  annualPayment: number
  
  // Calculation details
  independenceStatus: "independent" | "dependent"
  parentalIncomeTestApplied: boolean
  personalIncomeTestApplied: boolean
  assetsTestPassed: boolean
  
  // Breakdown for display
  calculationBreakdown: {
    step: string
    description: string
    amount?: number
  }[]
}

// 2026 Thresholds
const THRESHOLDS = {
  // Age limits
  AGE_MIN: 18,
  AGE_MAX: 24,
  
  // Parental Income Test
  PARENTAL_INCOME_FREE_AREA: 66722,
  PARENTAL_INCOME_REDUCTION_RATE: 0.20, // $0.20 per $1 over threshold
  
  // Personal Income Test
  PERSONAL_INCOME_FREE_AREA: 539, // per fortnight
  PERSONAL_INCOME_TIER1_MAX: 646, // per fortnight
  PERSONAL_INCOME_TIER1_REDUCTION_RATE: 0.50, // 50 cents per dollar
  PERSONAL_INCOME_TIER2_FLAT_REDUCTION: 53.50,
  PERSONAL_INCOME_TIER2_REDUCTION_RATE: 0.60, // 60 cents per dollar
  PERSONAL_INCOME_BANK_CAP: 13500, // Maximum credits
  
  // Personal Assets Test
  ASSETS_LIMIT_HOMEOWNER: 321500,
  ASSETS_LIMIT_NON_HOMEOWNER: 579500,
  
  // Maximum Fortnightly Rates (2026)
  MAX_RATE_SINGLE_AT_HOME: 482.40,
  MAX_RATE_SINGLE_AWAY: 677.20,
  MAX_RATE_SINGLE_WITH_CHILDREN: 854.20,
  MAX_RATE_PARTNERED_NO_CHILDREN: 677.20,
}

/**
 * Check if student is independent based on various criteria
 */
function checkIndependenceStatus(input: YouthAllowanceInput): {
  isIndependent: boolean
  reason?: string
} {
  // If explicitly marked as independent
  if (input.isIndependent) {
    return { isIndependent: true, reason: input.independenceReason || "declared" }
  }
  
  // Check independence criteria
  if (input.age >= 22) {
    return { isIndependent: true, reason: "age22" }
  }
  
  // Note: Other criteria (married, child, work history, regional) would need to be collected
  // For now, we rely on the isIndependent flag from the form
  
  return { isIndependent: false }
}

/**
 * Calculate parental income reduction
 * Uses family pool logic if siblings are also receiving payments
 */
function calculateParentalIncomeReduction(
  parentalIncome: number,
  siblingsCount: number = 0
): number {
  if (parentalIncome <= THRESHOLDS.PARENTAL_INCOME_FREE_AREA) {
    return 0
  }
  
  const excessIncome = parentalIncome - THRESHOLDS.PARENTAL_INCOME_FREE_AREA
  const totalReduction = excessIncome * THRESHOLDS.PARENTAL_INCOME_REDUCTION_RATE
  
  // Family pool: split reduction among all children receiving payments
  // siblingsCount = number of OTHER siblings (not including this student)
  const totalChildren = siblingsCount + 1
  const reductionPerChild = totalReduction / totalChildren
  
  return reductionPerChild
}

/**
 * Calculate personal income reduction
 * Implements the tiered reduction system
 */
function calculatePersonalIncomeReduction(
  personalIncome: number,
  incomeBank: number = 0
): number {
  if (!personalIncome || personalIncome <= 0) {
    return 0
  }
  
  // Apply income bank credits first
  let incomeAfterBank = Math.max(0, personalIncome - incomeBank)
  
  if (incomeAfterBank <= THRESHOLDS.PERSONAL_INCOME_FREE_AREA) {
    return 0
  }
  
  const excessOverFreeArea = incomeAfterBank - THRESHOLDS.PERSONAL_INCOME_FREE_AREA
  
  if (incomeAfterBank <= THRESHOLDS.PERSONAL_INCOME_TIER1_MAX) {
    // Tier 1: 50 cents per dollar over $539
    return excessOverFreeArea * THRESHOLDS.PERSONAL_INCOME_TIER1_REDUCTION_RATE
  } else {
    // Tier 2: $53.50 flat + 60 cents per dollar over $646
    const tier1Reduction = (THRESHOLDS.PERSONAL_INCOME_TIER1_MAX - THRESHOLDS.PERSONAL_INCOME_FREE_AREA) * THRESHOLDS.PERSONAL_INCOME_TIER1_REDUCTION_RATE
    const excessOverTier1 = incomeAfterBank - THRESHOLDS.PERSONAL_INCOME_TIER1_MAX
    return THRESHOLDS.PERSONAL_INCOME_TIER2_FLAT_REDUCTION + tier1Reduction + (excessOverTier1 * THRESHOLDS.PERSONAL_INCOME_TIER2_REDUCTION_RATE)
  }
}

/**
 * Determine base rate based on living situation
 */
function getBaseRate(input: YouthAllowanceInput): number {
  if (input.hasDependentChildren) {
    return THRESHOLDS.MAX_RATE_SINGLE_WITH_CHILDREN
  }
  
  if (input.isPartnered) {
    return THRESHOLDS.MAX_RATE_PARTNERED_NO_CHILDREN
  }
  
  // Determine if living at home or away
  const isLivingAtHome = input.livingSituation === "home"
  
  if (isLivingAtHome) {
    return THRESHOLDS.MAX_RATE_SINGLE_AT_HOME
  } else {
    // Away from home: renting, moving_out, on-campus, unsure (assumed away)
    return THRESHOLDS.MAX_RATE_SINGLE_AWAY
  }
}

/**
 * Main calculation function
 */
export function calculateYouthAllowance(input: YouthAllowanceInput): YouthAllowanceResult {
  const breakdown: { step: string; description: string; amount?: number }[] = []
  const eligibleReasons: string[] = []
  const ineligibleReasons: string[] = []
  
  // Gate 1: Core Eligibility
  breakdown.push({ step: "Gate 1", description: "Checking core eligibility..." })
  
  if (input.age < THRESHOLDS.AGE_MIN || input.age > THRESHOLDS.AGE_MAX) {
    ineligibleReasons.push(`Age ${input.age} is outside the eligible range (${THRESHOLDS.AGE_MIN}-${THRESHOLDS.AGE_MAX} years)`)
    return {
      eligible: false,
      eligibleReasons: [],
      ineligibleReasons,
      baseRate: 0,
      parentalIncomeReduction: 0,
      personalIncomeReduction: 0,
      finalFortnightlyPayment: 0,
      annualPayment: 0,
      independenceStatus: "dependent",
      parentalIncomeTestApplied: false,
      personalIncomeTestApplied: false,
      assetsTestPassed: false,
      calculationBreakdown: breakdown,
    }
  }
  eligibleReasons.push(`Age ${input.age} is within eligible range`)
  
  if (!input.studyLoadFullTime && !input.concessionalStudyLoad) {
    ineligibleReasons.push("Must be studying full-time (75%+ load) or have concessional study load")
    return {
      eligible: false,
      eligibleReasons: [],
      ineligibleReasons,
      baseRate: 0,
      parentalIncomeReduction: 0,
      personalIncomeReduction: 0,
      finalFortnightlyPayment: 0,
      annualPayment: 0,
      independenceStatus: "dependent",
      parentalIncomeTestApplied: false,
      personalIncomeTestApplied: false,
      assetsTestPassed: false,
      calculationBreakdown: breakdown,
    }
  }
  eligibleReasons.push("Study load requirement met")
  
  // Gate 2: Independence Status
  breakdown.push({ step: "Gate 2", description: "Determining independence status..." })
  const independence = checkIndependenceStatus(input)
  const independenceStatus = independence.isIndependent ? "independent" : "dependent"
  
  if (independence.isIndependent) {
    eligibleReasons.push(`Independent student (${independence.reason || "declared"})`)
    breakdown.push({ step: "Independence", description: `Student is independent: ${independence.reason || "declared"}` })
  } else {
    breakdown.push({ step: "Independence", description: "Student is dependent - parental income test will apply" })
  }
  
  // Gate 3: Financial Tests
  breakdown.push({ step: "Gate 3", description: "Applying financial tests..." })
  
  // Assets Test
  let assetsTestPassed = true
  if (input.personalAssets !== undefined && input.personalAssets > 0) {
    const assetsLimit = input.isHomeowner 
      ? THRESHOLDS.ASSETS_LIMIT_HOMEOWNER 
      : THRESHOLDS.ASSETS_LIMIT_NON_HOMEOWNER
    
    if (input.personalAssets > assetsLimit) {
      assetsTestPassed = false
      ineligibleReasons.push(`Personal assets ($${input.personalAssets.toLocaleString()}) exceed the limit ($${assetsLimit.toLocaleString()})`)
      breakdown.push({ 
        step: "Assets Test", 
        description: `Assets exceed limit: $${input.personalAssets.toLocaleString()} > $${assetsLimit.toLocaleString()}` 
      })
    } else {
      breakdown.push({ 
        step: "Assets Test", 
        description: `Assets within limit: $${input.personalAssets.toLocaleString()} ≤ $${assetsLimit.toLocaleString()}` 
      })
    }
  }
  
  if (!assetsTestPassed) {
    return {
      eligible: false,
      eligibleReasons,
      ineligibleReasons,
      baseRate: 0,
      parentalIncomeReduction: 0,
      personalIncomeReduction: 0,
      finalFortnightlyPayment: 0,
      annualPayment: 0,
      independenceStatus,
      parentalIncomeTestApplied: false,
      personalIncomeTestApplied: false,
      assetsTestPassed: false,
      calculationBreakdown: breakdown,
    }
  }
  
  // Determine base rate
  const baseRate = getBaseRate(input)
  breakdown.push({ 
    step: "Base Rate", 
    description: `Base rate determined: $${baseRate.toFixed(2)}/fortnight (${input.livingSituation})`,
    amount: baseRate 
  })
  
  // Parental Income Test (only for dependent students)
  let parentalIncomeReduction = 0
  let parentalIncomeTestApplied = false
  
  if (independenceStatus === "dependent" && input.parentalIncomeAnnual !== undefined) {
    parentalIncomeTestApplied = true
    const siblingsCount = input.siblingsReceivingPayments || 0
    parentalIncomeReduction = calculateParentalIncomeReduction(
      input.parentalIncomeAnnual,
      siblingsCount
    )
    
    if (parentalIncomeReduction > 0) {
      breakdown.push({ 
        step: "Parental Income Test", 
        description: `Parental income $${input.parentalIncomeAnnual.toLocaleString()}/year reduces payment by $${parentalIncomeReduction.toFixed(2)}/fortnight${siblingsCount > 0 ? ` (shared with ${siblingsCount} sibling${siblingsCount > 1 ? 's' : ''})` : ''}`,
        amount: -parentalIncomeReduction 
      })
    } else {
      breakdown.push({ 
        step: "Parental Income Test", 
        description: `Parental income $${input.parentalIncomeAnnual.toLocaleString()}/year is within free area - no reduction`,
        amount: 0 
      })
    }
  }
  
  // Personal Income Test (applies to all students)
  let personalIncomeReduction = 0
  let personalIncomeTestApplied = false
  
  if (input.personalIncomeFortnightly !== undefined && input.personalIncomeFortnightly > 0) {
    personalIncomeTestApplied = true
    // Note: Income bank calculation would require tracking over time
    // For now, we assume no income bank credits
    personalIncomeReduction = calculatePersonalIncomeReduction(input.personalIncomeFortnightly, 0)
    
    if (personalIncomeReduction > 0) {
      breakdown.push({ 
        step: "Personal Income Test", 
        description: `Personal income $${input.personalIncomeFortnightly.toFixed(2)}/fortnight reduces payment by $${personalIncomeReduction.toFixed(2)}/fortnight`,
        amount: -personalIncomeReduction 
      })
    } else {
      breakdown.push({ 
        step: "Personal Income Test", 
        description: `Personal income $${input.personalIncomeFortnightly.toFixed(2)}/fortnight is within free area - no reduction`,
        amount: 0 
      })
    }
  }
  
  // Calculate final payment
  const finalFortnightlyPayment = Math.max(0, baseRate - parentalIncomeReduction - personalIncomeReduction)
  const annualPayment = finalFortnightlyPayment * 26 // 26 fortnights per year
  
  breakdown.push({ 
    step: "Final Calculation", 
    description: `Final payment: $${baseRate.toFixed(2)} - $${parentalIncomeReduction.toFixed(2)} - $${personalIncomeReduction.toFixed(2)} = $${finalFortnightlyPayment.toFixed(2)}/fortnight`,
    amount: finalFortnightlyPayment 
  })
  
  const eligible = finalFortnightlyPayment > 0 && assetsTestPassed
  
  if (eligible) {
    eligibleReasons.push(`Eligible for $${finalFortnightlyPayment.toFixed(2)} per fortnight`)
  } else if (finalFortnightlyPayment === 0 && assetsTestPassed) {
    ineligibleReasons.push("Payment reduced to zero due to income tests")
  }
  
  return {
    eligible,
    eligibleReasons,
    ineligibleReasons,
    baseRate,
    parentalIncomeReduction,
    personalIncomeReduction,
    finalFortnightlyPayment,
    annualPayment,
    independenceStatus,
    parentalIncomeTestApplied,
    personalIncomeTestApplied,
    assetsTestPassed,
    calculationBreakdown: breakdown,
  }
}

/**
 * Helper function to convert household income string to annual amount
 * Uses conservative estimates (midpoints) for calculation
 */
export function parseHouseholdIncome(incomeBand: string): number | null {
  const incomeMap: Record<string, number> = {
    "under-66722": 50000, // Conservative: use lower bound
    "66723-80k": 73361, // Midpoint: (66723 + 80000) / 2
    "80k-100k": 90000, // Midpoint: (80001 + 100000) / 2
    "100k-150k": 125000, // Midpoint: (100001 + 150000) / 2
    "over-150k": 175000, // Conservative estimate
  }
  
  return incomeMap[incomeBand] || null
}

/**
 * Helper function to convert personal income string to fortnightly amount
 * Uses conservative estimates for calculation
 */
export function parsePersonalIncomeFortnightly(incomeBand: string): number | null {
  const incomeMap: Record<string, number> = {
    "under-190": 150, // Conservative: use midpoint of range
    "190-539": 364, // Midpoint: (190 + 539) / 2
    "over-539": 700, // Conservative estimate for calculation
  }
  
  return incomeMap[incomeBand] || null
}
