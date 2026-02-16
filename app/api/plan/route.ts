import { NextRequest, NextResponse } from "next/server"
import { generateUACTimelineFromCSV } from "@/lib/data/uac-parser"
import { calculateCommuteRoute } from "@/lib/data/nsw-trip-planner"
import { parseBenefitsCSV, type BenefitDefinition } from "@/lib/data/benefits-parser"
import { getAllMatchingFacultiesForUni, getAllAvailableFacultiesForUni } from "@/lib/data/fees-parser"
import { getRentalAveragesByPostcode, getNearbySuburbNamesOnly } from "@/lib/data/rental-supabase"
import {
  calculateYouthAllowance,
  parseHouseholdIncome,
  parsePersonalIncomeFortnightly,
  type YouthAllowanceInput,
} from "@/lib/data/youth-allowance-calculator"
import { calculateRentAssistance } from "@/lib/data/rent-assistance-calculator"
import { UNIVERSITY_POSTCODE } from "@/lib/data/geocoding"

function getRentalPostcodeAndLabel(userData: any): { postcode: string; locationLabel?: string } {
  const currentDwelling = (userData?.postcode ?? "2000").toString().replace(/\D/g, "").padStart(4, "0")
  if (userData?.livingSituation === "Renting/Moving out" && userData?.preferredLocationPostcode) {
    const preferred = String(userData.preferredLocationPostcode).replace(/\D/g, "").padStart(4, "0")
    if (preferred.length === 4) {
      return { postcode: preferred, locationLabel: `Preferred location (${preferred})` }
    }
  }
  return { postcode: currentDwelling, locationLabel: "Current dwelling" }
}

async function calculateCommute(userData: any) {
  const universities = userData.targetUniversities || []
  
  // Calculate routes for each university
  const routes = await Promise.all(
    universities.map(async (uni: string) => {
      try {
        const route = await calculateCommuteRoute(userData.postcode, uni)
        return {
          university: route.university,
          fromPostcode: route.fromPostcode,
          travelTime: route.travelTime,
          cost: route.cost,
          costUncapped: route.costUncapped,
          costIsCapped: route.costIsCapped,
          transportOptions: route.transportOptions,
          accessibility: route.accessibility,
          distance: route.distance,
          routeDetails: route.routeDetails,
        }
      } catch (error) {
        console.error(`Error calculating route to ${uni}:`, error)
        // Fallback to basic estimate
        return {
          university: uni,
          fromPostcode: userData.postcode,
          travelTime: 45, // fallback
          cost: "5.00",
          costUncapped: undefined,
          costIsCapped: undefined,
          transportOptions: ["Train", "Bus"],
          accessibility: "Unknown",
          distance: 20,
        }
      }
    })
  )
  
  return routes
}
const MOCK_RENTS = [350, 320, 380]
const MOCK_BY_BEDROOMS: Record<string, { apartment: number; house: number; townhouse: number }> = {
  "0": { apartment: 320, house: 0, townhouse: 0 },
  "1": { apartment: 380, house: 400, townhouse: 370 },
  "2": { apartment: 450, house: 520, townhouse: 480 },
  "3": { apartment: 550, house: 600, townhouse: 550 },
  "4": { apartment: 650, house: 720, townhouse: 620 },
}

function mockSuburbEntry(
  name: string,
  distance: string,
  offset: number
): { name: string; distance: string; medianRent: number; medianWeeklyRent: RentByType; byBedrooms: Record<string, RentByType> } {
  const medianWeeklyRent: RentByType = {
    apartment: MOCK_RENTS[0] + offset,
    house: MOCK_RENTS[1] + offset + 30,
    townhouse: MOCK_RENTS[2] + offset - 20,
  }
  const byBedrooms: Record<string, RentByType> = {}
  for (const [k, v] of Object.entries(MOCK_BY_BEDROOMS)) {
    byBedrooms[k] = {
      apartment: v.apartment + offset,
      house: v.house + offset,
      townhouse: v.townhouse + offset,
    }
  }
  const medianRent = Math.round(
    (medianWeeklyRent.apartment + medianWeeklyRent.house + medianWeeklyRent.townhouse) / 3
  )
  return { name, distance, medianRent, medianWeeklyRent, byBedrooms }
}

type RentByType = { apartment: number; house: number; townhouse: number }

async function getMockRentalData(postcode: string, locationLabel?: string) {
  let nearbySuburbs = [
    mockSuburbEntry("Suburb A", "2 km", 0),
    mockSuburbEntry("Suburb B", "5 km", -20),
    mockSuburbEntry("Suburb C", "8 km", 15),
  ]
  try {
    const names = await getNearbySuburbNamesOnly(postcode, 3)
    if (names.length > 0) {
      nearbySuburbs = names.map((n, i) =>
        mockSuburbEntry(n.name, n.distance, [-20, 0, 15][i % 3] ?? 0)
      )
    }
  } catch (_) {
    // keep placeholder names
  }
  const baseRent: RentByType = { apartment: 380, house: 450, townhouse: 420 }
  const byBedrooms: Record<string, RentByType> = { ...MOCK_BY_BEDROOMS }
  return {
    postcode: String(postcode).padStart(4, "0"),
    ...(locationLabel && { locationLabel }),
    medianWeeklyRent: baseRent,
    byBedrooms,
    nearbySuburbs,
  }
}

async function getRentalData(postcode: string, locationLabel?: string) {
  const pc = postcode?.trim() || "2000"
  try {
    const data = await getRentalAveragesByPostcode(pc, locationLabel)
    if (data.nearbySuburbs.length > 0 || data.medianWeeklyRent.apartment || data.medianWeeklyRent.house || data.medianWeeklyRent.townhouse) {
      return data
    }
  } catch (e) {
    console.warn("Rental Supabase fallback:", e)
  }
  return getMockRentalData(pc, locationLabel)
}

/** Map form living-situation labels to canonical values used in benefits CSV */
function normalizeLivingSituationForBenefits(formValue: string | undefined): string[] {
  if (!formValue) return []
  switch (formValue) {
    case "Staying at home":
      return ["home"]
    case "Renting/Moving out":
      return ["renting", "moving_out"]
    case "On-campus accommodation":
      return ["on-campus"]
    case "Remote/Regional area":
      return ["remote"]
    case "Not sure yet":
      return ["unsure"]
    default:
      return [formValue]
  }
}

function evaluateBenefitEligibility(def: BenefitDefinition, userData: any): { eligible: boolean; reason?: string } {
  const age = typeof userData.age === 'number' ? userData.age : parseInt(String(userData.age ?? ''), 10)
  const income = userData.householdIncome
  const livingSituation = userData.livingSituation
  const isIndigenous = Boolean(userData.isIndigenous)
  const movingForStudy = Boolean(userData.movingForStudy)

  if (def.alwaysEligible) return { eligible: true }

  if (def.ageMin != null && (Number.isNaN(age) || age < def.ageMin)) {
    return { eligible: false, reason: `Minimum age is ${def.ageMin}` }
  }
  if (def.ageMax != null && (Number.isNaN(age) || age > def.ageMax)) {
    return { eligible: false, reason: `Maximum age is ${def.ageMax}` }
  }
  if (def.incomeBands != null && def.incomeBands.length > 0) {
    if (!income || !def.incomeBands.includes(income)) {
      return { eligible: false, reason: "Household income may not meet eligibility" }
    }
  }
  if (def.livingSituation != null && def.livingSituation.length > 0) {
    const normalizedLiving = normalizeLivingSituationForBenefits(livingSituation)
    const matches = normalizedLiving.some((n) => def.livingSituation!.includes(n))
    if (!livingSituation || !matches) {
      return { eligible: false, reason: "Living situation may not meet eligibility" }
    }
  }
  if (def.requiresIndigenous === true && !isIndigenous) {
    return { eligible: false, reason: "Eligibility is for Aboriginal and Torres Strait Islander students" }
  }
  // Tertiary Access Payment: only for users in Remote/Regional area
  if (def.id === "tertiary_access_payment") {
    const normalizedLiving = normalizeLivingSituationForBenefits(livingSituation)
    if (!normalizedLiving.includes("remote")) {
      return { eligible: false, reason: "For students in a remote or regional area" }
    }
    return { eligible: true }
  }
  if (def.requiresMovingForStudy === true && !movingForStudy) {
    return { eligible: false, reason: "For students relocating to study" }
  }

  return { eligible: true }
}

/** Map form living situation to calculator livingSituation */
function mapLivingSituationForYA(formValue: string | undefined): YouthAllowanceInput["livingSituation"] {
  if (!formValue) return "unsure"
  switch (formValue) {
    case "Staying at home":
      return "home"
    case "Renting/Moving out":
      return "renting"
    case "On-campus accommodation":
      return "on-campus"
    case "Remote/Regional area":
      return "away"
    case "Not sure yet":
      return "unsure"
    default:
      return "unsure"
  }
}

/** Map siblings form value to number (for parental income family pool) */
function parseSiblingsReceivingPayments(value: string | undefined): number {
  if (!value || value === "no") return 0
  if (value === "yes-1") return 1
  if (value === "yes-2") return 2
  if (value === "yes-3plus") return 3
  return 0
}

/** Build Youth Allowance input from plan questionnaire (Household Income, Study Load, Personal Income & Assets, Siblings). */
function buildYouthAllowanceInput(userData: any): YouthAllowanceInput | null {
  const age = typeof userData.age === "number" ? userData.age : parseInt(String(userData.age ?? ""), 10)
  if (!Number.isFinite(age)) return null

  const studyLoadFullTime = userData.studyLoadFullTime === "yes"
  const concessionalStudyLoad = userData.concessionalStudyLoad === "yes"
  const isIndependent = userData.consideredIndependent === "yes"

  const householdIncomeBand = userData.householdIncome
  const parentalIncomeAnnual =
    householdIncomeBand && householdIncomeBand !== "prefer-not-to-say"
      ? parseHouseholdIncome(householdIncomeBand) ?? undefined
      : undefined

  const personalIncomeBand = userData.personalIncomeFortnightly
  const personalIncomeFortnightly =
    personalIncomeBand && personalIncomeBand !== "prefer-not-to-say"
      ? parsePersonalIncomeFortnightly(personalIncomeBand) ?? undefined
      : undefined

  let personalAssets: number | undefined
  if (userData.significantAssets === "yes" && userData.significantAssetsValue) {
    const parsed = parseFloat(String(userData.significantAssetsValue).replace(/[^0-9.-]/g, ""))
    if (Number.isFinite(parsed)) personalAssets = parsed
  }

  const siblingsReceivingPayments = parseSiblingsReceivingPayments(userData.siblingsReceivingPayments)

  return {
    age,
    studyLoadFullTime,
    concessionalStudyLoad,
    isIndependent,
    parentalIncomeAnnual,
    siblingsReceivingPayments,
    personalIncomeFortnightly,
    personalAssets,
    isHomeowner: false,
    livingSituation: mapLivingSituationForYA(userData.livingSituation),
  }
}

/**
 * Run Youth Allowance calculation and return eligibility plus formatted estimate for benefits triage.
 * Uses Household Income, Study Load, Personal Income & Assets, and Siblings from the questionnaire.
 * Logic and thresholds aligned with Services Australia / studyassist.gov.au (parental income test,
 * personal income test, assets test, living-at-home vs away rates).
 */
function getYouthAllowanceEstimate(userData: any): {
  eligible: boolean
  reason?: string
  estimatedAmount?: string
  finalFortnightlyPayment: number
} {
  const input = buildYouthAllowanceInput(userData)
  if (!input) {
    return { eligible: false, reason: "Age or study details missing", finalFortnightlyPayment: 0 }
  }

  const result = calculateYouthAllowance(input)

  if (!result.eligible && result.ineligibleReasons.length > 0) {
    return {
      eligible: false,
      reason: result.ineligibleReasons[0],
      estimatedAmount: undefined,
      finalFortnightlyPayment: 0,
    }
  }

  if (result.finalFortnightlyPayment > 0) {
    return {
      eligible: true,
      estimatedAmount: `Approx. $${Math.round(result.finalFortnightlyPayment)} per fortnight (use calculator below for breakdown)`,
      reason: undefined,
      finalFortnightlyPayment: result.finalFortnightlyPayment,
    }
  }

  return {
    eligible: true,
    estimatedAmount: "Payment reduced to $0 by income tests (see calculator for details)",
    reason: undefined,
    finalFortnightlyPayment: 0,
  }
}

/**
 * Rent Assistance estimate from questionnaire: rental budget (weekly), Youth Allowance amount, personal income.
 * Uses 2026 thresholds; single + private rent unless we have more data.
 */
function getRentAssistanceEstimate(
  userData: any,
  youthAllowanceFortnightly: number
): { eligible: boolean; estimatedAmount?: string; reason?: string } {
  const livingSituation = userData?.livingSituation
  const isRenting =
    livingSituation === "Renting/Moving out" ||
    livingSituation === "renting" ||
    livingSituation === "moving_out"
  if (!isRenting) {
    return {
      eligible: false,
      estimatedAmount: undefined,
      reason: "Rent Assistance applies when you pay rent (e.g. renting or moving out).",
    }
  }

  const rentalBudgetWeekly = userData?.rentalBudget
  const fortnightlyRent =
    rentalBudgetWeekly != null && rentalBudgetWeekly !== ""
      ? parseFloat(String(rentalBudgetWeekly).replace(/[^0-9.-]/g, "")) * 2
      : 0

  const personalIncomeBand = userData?.personalIncomeFortnightly
  const personalIncomeFortnightly =
    personalIncomeBand && personalIncomeBand !== "prefer-not-to-say"
      ? parsePersonalIncomeFortnightly(personalIncomeBand) ?? undefined
      : undefined

  if (!Number.isFinite(fortnightlyRent) || fortnightlyRent <= 0) {
    return {
      eligible: true,
      estimatedAmount: "Enter your rent in the calculator below for an estimate.",
      reason: undefined,
    }
  }

  const raResult = calculateRentAssistance({
    fortnightlyAmount: fortnightlyRent,
    rentType: "private",
    householdType: "single",
    basePaymentFortnightly: youthAllowanceFortnightly,
    personalIncomeFortnightly,
  })

  if (!raResult.eligible) {
    return {
      eligible: true,
      estimatedAmount: `Rent $${(fortnightlyRent / 2).toFixed(0)}/week may be below threshold — use calculator below.`,
      reason: undefined,
    }
  }

  const amount = Math.round(raResult.rentAssistanceFortnightly)
  return {
    eligible: true,
    estimatedAmount: `Approx. $${amount} per fortnight (use calculator below for details)`,
    reason: undefined,
  }
}

function checkBenefitsEligibility(userData: any) {
  const definitions = parseBenefitsCSV()
  const benefits: any[] = []
  
  // Youth Allowance: estimate from questionnaire (Household Income, Study Load, Personal Income & Assets, Siblings)
  const youthAllowanceEstimate = getYouthAllowanceEstimate(userData)
  const youthAllowanceDef = definitions.find(d => d.id === "youth_allowance")

  if (youthAllowanceDef) {
    benefits.push({
      name: youthAllowanceDef.name,
      eligible: youthAllowanceEstimate.eligible,
      estimatedAmount: youthAllowanceEstimate.estimatedAmount,
      reason: youthAllowanceEstimate.reason,
      nextSteps: youthAllowanceDef.nextSteps,
      learnMoreUrl: youthAllowanceDef.learnMoreUrl,
    })
  }
  
  // Rent Assistance: estimate from questionnaire (rental budget, Youth Allowance amount, personal income)
  const rentAssistanceEstimate = getRentAssistanceEstimate(userData, youthAllowanceEstimate.finalFortnightlyPayment)
  const rentAssistanceDef = definitions.find(d => d.id === "rent_assistance")

  if (rentAssistanceDef) {
    benefits.push({
      name: rentAssistanceDef.name,
      eligible: rentAssistanceEstimate.eligible,
      estimatedAmount: rentAssistanceEstimate.estimatedAmount,
      reason: rentAssistanceEstimate.reason,
      nextSteps: rentAssistanceDef.nextSteps,
      learnMoreUrl: rentAssistanceDef.learnMoreUrl,
    })
  }

  // Process other benefits (excluding Youth Allowance and Rent Assistance)
  const otherBenefits = definitions
    .filter(def => def.id !== "youth_allowance" && def.id !== "rent_assistance")
    .map((def) => {
      const { eligible, reason } = evaluateBenefitEligibility(def, userData)
      return {
        name: def.name,
        eligible,
        ...(def.estimatedAmount && { estimatedAmount: def.estimatedAmount }),
        ...(reason && { reason }),
        nextSteps: def.nextSteps,
        learnMoreUrl: def.learnMoreUrl,
      }
    })

  return [...benefits, ...otherBenefits]
}

const DEFAULT_ANNUAL_FEE = 15000 // Fallback when no CSV data (AUD)
const DEFAULT_COURSE_YEARS = 3

function calculateFees(userData: any) {
  const universities: string[] = userData.targetUniversities || []
  const preferredFields: string[] = userData.preferredFields || []
  const primaryPreference = preferredFields.length > 0 ? preferredFields[0] : null

  // Build byUniversity array with all matching faculties per university
  type UniversityFeeEntry = {
    university: string
    faculty: string
    estimatedAnnualFee: number
    courseYears: number
    estimatedTotalFee: number
    isPrimary: boolean
    isPrimaryUniversity: boolean
    facultyUrl?: string
  }

  type UnavailableFacultyWarning = {
    university: string
    unavailableFaculties: string[]
    availableFaculties: string[]
  }
  
  const byUniversity: Array<UniversityFeeEntry> = []
  const warnings: UnavailableFacultyWarning[] = []
  
  universities.forEach((uni: string, uniIndex) => {
    const matchingFaculties = getAllMatchingFacultiesForUni(uni, preferredFields)
    const isFirstUniversity = uniIndex === 0

    if (matchingFaculties.length > 0) {
      // Add each matching faculty as a separate entry
      matchingFaculties.forEach((facultyFee, index) => {
        // Only the first university's first matching faculty is marked as primary (for summary)
        const isPrimary = isFirstUniversity && index === 0 && primaryPreference !== null
        
        const entry: UniversityFeeEntry = {
          university: uni,
          faculty: facultyFee.faculty,
          estimatedAnnualFee: facultyFee.annualFee,
          courseYears: facultyFee.courseYears,
          estimatedTotalFee: facultyFee.annualFee * facultyFee.courseYears,
          isPrimary,
          isPrimaryUniversity: isFirstUniversity,
          facultyUrl: facultyFee.facultyUrl,
        }
        
        byUniversity.push(entry)
      })

      // Check if some preferred fields are unavailable
      const availableFaculties = getAllAvailableFacultiesForUni(uni)
      const unavailableFaculties = preferredFields.filter(
        (field) => !availableFaculties.some(
          (available) => available.trim().toLowerCase() === field.trim().toLowerCase()
        )
      )

      if (unavailableFaculties.length > 0) {
        warnings.push({
          university: uni,
          unavailableFaculties,
          availableFaculties,
        })
      }
    } else {
      // No matching faculties: track as warning instead of creating fallback entry
      const availableFaculties = getAllAvailableFacultiesForUni(uni)
      
      if (availableFaculties.length > 0) {
        // University exists but doesn't offer any preferred fields
        warnings.push({
          university: uni,
          unavailableFaculties: preferredFields,
          availableFaculties,
        })
      }
      // If no CSV data exists at all, we skip adding anything (no fallback entry)
    }
  })

  // Summary totals: use only the first university's primary preference
  const firstUniversityPrimaryEntry = byUniversity.find((entry) => entry.isPrimary)
  let estimatedAnnualFee: number
  let courseYearsForTotal: number
  
  if (firstUniversityPrimaryEntry) {
    estimatedAnnualFee = firstUniversityPrimaryEntry.estimatedAnnualFee
    courseYearsForTotal = firstUniversityPrimaryEntry.courseYears
  } else if (byUniversity.length > 0) {
    estimatedAnnualFee = Math.round(
      byUniversity.reduce((a, u) => a + u.estimatedAnnualFee, 0) / byUniversity.length
    )
    courseYearsForTotal = Math.round(
      byUniversity.reduce((a, u) => a + u.courseYears, 0) / byUniversity.length
    )
  } else {
    estimatedAnnualFee = DEFAULT_ANNUAL_FEE
    courseYearsForTotal = DEFAULT_COURSE_YEARS
  }

  return {
    estimatedAnnualFee,
    estimatedTotalFee: estimatedAnnualFee * courseYearsForTotal,
    hecsHelp: {
      available: true,
      repaymentThreshold: 67000, // 2025-26 threshold (repayment on income above this)
      estimatedRepayment: "Starts when income exceeds threshold (2025-26 rates apply)",
    },
    upfrontPayment: {
      discount: "10% discount if paid upfront",
      amount: (estimatedAnnualFee * 0.9).toFixed(2),
    },
    byUniversity,
    unavailableFacultiesWarnings: warnings,
  }
}

/** Minimal UAC timeline shape needed for checklist due dates. */
type UACTimelineForChecklist = { applicationDeadline?: string; offerRounds?: Array<{ applyBy: string }> }

function generateChecklist(userData: any, uacTimeline?: UACTimelineForChecklist | null) {
  const applicationDeadline =
    uacTimeline?.applicationDeadline && uacTimeline.applicationDeadline.length > 0
      ? uacTimeline.applicationDeadline
      : null

  return [
    {
      category: "Your next steps",
      items: [
        { task: "Create UAC account", dueDate: null, completed: false },
        { task: "Research universities and courses", dueDate: null, completed: false },
        { task: "Submit application by deadline", dueDate: applicationDeadline, completed: false },
        { task: "Apply for government Support (If eligible)", dueDate: null, completed: false },
        { task: "Accept offer and complete enrolment", dueDate: null, completed: false },
      ],
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // UAC timeline is needed for checklist due dates, so compute it first
    const uacTimeline = generateUACTimelineFromCSV(userData)

    const [
      commuteData,
      rentalData,
      benefitsEligibility,
      feesEstimate,
      checklist,
    ] = await Promise.all([
      calculateCommute(userData),
      (() => {
        const { postcode, locationLabel } = getRentalPostcodeAndLabel(userData)
        return getRentalData(postcode, locationLabel)
      })(),
      Promise.resolve(checkBenefitsEligibility({ ...userData, movingForStudy: userData.livingSituation === 'moving_out' || userData.livingSituation === 'Renting/Moving out' })),
      Promise.resolve(calculateFees(userData)),
      Promise.resolve(generateChecklist(userData, uacTimeline)),
    ])

    return NextResponse.json({
      uacTimeline,
      commuteData,
      rentalData,
      benefitsEligibility,
      feesEstimate,
      checklist,
    })
  } catch (error) {
    console.error("Error generating plan:", error)
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    )
  }
}
