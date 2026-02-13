/**
 * Rent Assistance Calculator (2026 thresholds)
 * Supplementary payment added to Youth Allowance, Austudy, or ABSTUDY when paying eligible rent.
 * Formula: (Fortnightly Rent - Rent Threshold) × 0.75 = Rent Assistance (capped at Max Rate).
 */

export type HouseholdType = "single" | "single_sharer" | "couple"
export type RentType = "private" | "board_lodging" | "board_only"

export interface RentAssistanceInput {
  /** Fortnightly amount paid: rent (private) or total board/lodging payment */
  fortnightlyAmount: number
  rentType: RentType
  householdType: HouseholdType
  /** Base payment (e.g. Youth Allowance) before RA - for income test note */
  basePaymentFortnightly?: number
  /** Personal income per fortnight - if high, RA can be reduced to $0 */
  personalIncomeFortnightly?: number
}

export interface RentAssistanceResult {
  eligible: boolean
  eligibleRent: number
  rentThreshold: number
  maxRate: number
  rentAssistanceBeforeCap: number
  rentAssistanceFortnightly: number
  /** If income test reduces base to $0, RA is also $0 */
  incomeTestReducesToZero: boolean
  warnings: string[]
}

// 2026 Rent Assistance thresholds (early 2026)
const RA_2026 = {
  single: {
    rentThreshold: 152,
    maxRate: 215.4,
    rentCeiling: 439.2,
  },
  single_sharer: {
    rentThreshold: 152,
    maxRate: 143.6,
    rentCeiling: 343.47,
  },
  couple: {
    rentThreshold: 246.2,
    maxRate: 203,
    rentCeiling: 516.87,
  },
} as const

/**
 * Convert board/lodging payment to "eligible rent" for the formula.
 * Board and lodging: use 2/3 of total. Board only: use 1/3.
 */
export function getEligibleRentAmount(fortnightlyAmount: number, rentType: RentType): number {
  if (rentType === "private") return fortnightlyAmount
  if (rentType === "board_lodging") return (2 / 3) * fortnightlyAmount
  if (rentType === "board_only") return (1 / 3) * fortnightlyAmount
  return fortnightlyAmount
}

/**
 * Calculate Rent Assistance using the 75% rule.
 * (Eligible Rent - Threshold) × 0.75, capped at Max Rate for household type.
 */
export function calculateRentAssistance(input: RentAssistanceInput): RentAssistanceResult {
  const warnings: string[] = []
  const eligibleRent = getEligibleRentAmount(input.fortnightlyAmount, input.rentType)
  const config = RA_2026[input.householdType]
  const rentThreshold = config.rentThreshold
  const maxRate = config.maxRate

  if (eligibleRent < rentThreshold) {
    return {
      eligible: false,
      eligibleRent,
      rentThreshold,
      maxRate,
      rentAssistanceBeforeCap: 0,
      rentAssistanceFortnightly: 0,
      incomeTestReducesToZero: false,
      warnings: [
        `Your eligible rent ($${eligibleRent.toFixed(2)}/fortnight) is below the threshold ($${rentThreshold}/fortnight). You need to pay more than $${rentThreshold} in eligible rent to receive Rent Assistance.`,
      ],
    }
  }

  const rentAssistanceBeforeCap = (eligibleRent - rentThreshold) * 0.75
  const rentAssistanceFortnightly = Math.min(rentAssistanceBeforeCap, maxRate)

  // Income test: RA is added to base before the personal income test. If base + RA is reduced to $0, RA is $0.
  let incomeTestReducesToZero = false
  if (
    input.basePaymentFortnightly != null &&
    input.personalIncomeFortnightly != null &&
    input.personalIncomeFortnightly > 539
  ) {
    const totalBeforeTest = input.basePaymentFortnightly + rentAssistanceFortnightly
    // Simplified: if base is already 0 or very low, high income can wipe out the rest
    if (input.basePaymentFortnightly <= 0) {
      incomeTestReducesToZero = true
      warnings.push(
        "If your main payment (e.g. Youth Allowance) is reduced to $0 by the income test, your Rent Assistance will also be $0."
      )
    } else {
      warnings.push(
        "Rent Assistance is added to your base payment before the income test. If your total payment is reduced to $0 by income, Rent Assistance will also be $0."
      )
    }
  }

  return {
    eligible: true,
    eligibleRent,
    rentThreshold,
    maxRate,
    rentAssistanceBeforeCap,
    rentAssistanceFortnightly,
    incomeTestReducesToZero,
    warnings,
  }
}

/**
 * Get display-friendly label for rent type
 */
export function getRentTypeLabel(rentType: RentType): string {
  switch (rentType) {
    case "private":
      return "Private rent (e.g. share house, apartment)"
    case "board_lodging":
      return "Board and lodging (room + meals)"
    case "board_only":
      return "Board only (room, no meals)"
    default:
      return rentType
  }
}

/**
 * Get display-friendly label for household type
 */
export function getHouseholdTypeLabel(householdType: HouseholdType): string {
  switch (householdType) {
    case "single":
      return "Single (not sharing)"
    case "single_sharer":
      return "Single, sharing (e.g. share house)"
    case "couple":
      return "Couple (combined)"
    default:
      return householdType
  }
}
