import { NextRequest, NextResponse } from "next/server"
import { generateUACTimelineFromCSV } from "@/lib/data/uac-parser"
import { calculateCommuteRoute } from "@/lib/data/nsw-trip-planner"
import { getRentalDataByPostcode, loadRentalData } from "@/lib/data/rental-parser"
import { parseBenefitsCSV, type BenefitDefinition } from "@/lib/data/benefits-parser"
import { getAllMatchingFacultiesForUni, getAllAvailableFacultiesForUni } from "@/lib/data/fees-parser"
// Youth Allowance detailed calculation is now handled in the calculator component on results page

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
          transportOptions: ["Train", "Bus"],
          accessibility: "Unknown",
          distance: 20,
        }
      }
    })
  )
  
  return routes
}
function getRentalData(postcode: string) {
  // Using mock data until rental data is moved to Supabase or CSV
  return getMockRentalData(postcode)
}

function getMockRentalData(postcode: string) {
  // Fallback mock data
  return {
    postcode,
    medianWeeklyRent: {
      apartment: Math.floor(Math.random() * 200) + 300, // $300-500
      house: Math.floor(Math.random() * 300) + 400, // $400-700
      share: Math.floor(Math.random() * 150) + 150, // $150-300
    },
    byBedrooms: {},
    nearbySuburbs: [
      { name: "Suburb A", distance: "2km", medianRent: 350 },
      { name: "Suburb B", distance: "5km", medianRent: 320 },
      { name: "Suburb C", distance: "8km", medianRent: 380 },
    ],
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
    if (!livingSituation || !def.livingSituation.includes(livingSituation)) {
      return { eligible: false, reason: "Living situation may not meet eligibility" }
    }
  }
  if (def.requiresIndigenous === true && !isIndigenous) {
    return { eligible: false, reason: "Eligibility is for Aboriginal and Torres Strait Islander students" }
  }
  if (def.requiresMovingForStudy === true && !movingForStudy) {
    return { eligible: false, reason: "For students relocating to study" }
  }

  return { eligible: true }
}

function checkBasicYouthAllowanceEligibility(userData: any): { eligible: boolean; reason?: string } {
  const age = typeof userData.age === 'number' ? userData.age : parseInt(String(userData.age ?? ''), 10)
  const studyLoadFullTime = userData.studyLoadFullTime === "yes"
  const concessionalStudyLoad = userData.concessionalStudyLoad === "yes"
  
  // Basic eligibility check only
  if (age < 18 || age > 24) {
    return { eligible: false, reason: `Age ${age} is outside the eligible range (18-24 years)` }
  }
  
  if (!studyLoadFullTime && !concessionalStudyLoad) {
    return { eligible: false, reason: "Must be studying full-time (75%+ load) or have concessional study load" }
  }
  
  return { eligible: true }
}

function checkBenefitsEligibility(userData: any) {
  const definitions = parseBenefitsCSV()
  const benefits: any[] = []
  
  // Check basic Youth Allowance eligibility (detailed calculation will be in calculator component)
  const youthAllowanceEligibility = checkBasicYouthAllowanceEligibility(userData)
  const youthAllowanceDef = definitions.find(d => d.id === "youth_allowance")
  
  if (youthAllowanceDef) {
    benefits.push({
      name: youthAllowanceDef.name,
      eligible: youthAllowanceEligibility.eligible,
      estimatedAmount: youthAllowanceEligibility.eligible
        ? "Use calculator below for detailed estimate"
        : undefined,
      reason: youthAllowanceEligibility.reason,
      nextSteps: youthAllowanceDef.nextSteps,
      learnMoreUrl: youthAllowanceDef.learnMoreUrl,
    })
  }
  
  // Process other benefits (excluding Youth Allowance)
  const otherBenefits = definitions
    .filter(def => def.id !== "youth_allowance")
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
      repaymentThreshold: 51950, // 2024-25 threshold
      estimatedRepayment: "Starts when income exceeds threshold",
    },
    upfrontPayment: {
      discount: "10% discount if paid upfront",
      amount: (estimatedAnnualFee * 0.9).toFixed(2),
    },
    byUniversity,
    unavailableFacultiesWarnings: warnings,
  }
}

function generateChecklist(userData: any) {
  const checklist = []

  // Pre-application
  checklist.push({
    category: "Pre-Application",
    items: [
      { task: "Research universities and courses", dueDate: null, completed: false },
      { task: "Attend university open days", dueDate: null, completed: false },
      { task: "Check entry requirements", dueDate: null, completed: false },
    ],
  })

  // UAC Application - using 2026 dates from CSV
  const septemberRound2Deadline = "2025-08-21" // September Round 2 application deadline (from CSV)
  checklist.push({
    category: "UAC Application",
    items: [
      { task: "Create UAC account", dueDate: "2025-04-01", completed: false },
      { task: "Submit application by deadline (September Round 2)", dueDate: septemberRound2Deadline, completed: false },
      { task: "Pay application fee", dueDate: septemberRound2Deadline, completed: false },
      { task: "Upload required documents", dueDate: null, completed: false },
      { task: "Change preferences (if needed)", dueDate: null, completed: false },
    ],
  })

  // Benefits & Support
  checklist.push({
    category: "Benefits & Support",
    items: [
      { task: "Apply for Youth Allowance (if eligible)", dueDate: null, completed: false },
      { task: "Apply for Opal Concession Card", dueDate: null, completed: false },
      { task: "Research scholarships", dueDate: null, completed: false },
    ],
  })

  // Accommodation
  if (userData.livingSituation === "renting" || userData.livingSituation === "unsure") {
    checklist.push({
      category: "Accommodation",
      items: [
        { task: "Research rental options", dueDate: null, completed: false },
        { task: "Visit potential properties", dueDate: null, completed: false },
        { task: "Prepare rental application documents", dueDate: null, completed: false },
      ],
    })
  }

  // Pre-Enrolment
  checklist.push({
    category: "Pre-Enrolment",
    items: [
      { task: "Accept offer (if received)", dueDate: null, completed: false },
      { task: "Complete enrolment", dueDate: null, completed: false },
      { task: "Organize student ID", dueDate: null, completed: false },
      { task: "Set up student email", dueDate: null, completed: false },
    ],
  })

  return checklist
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Process all tools in parallel
    const [
      uacTimeline,
      commuteData,
      rentalData,
      benefitsEligibility,
      feesEstimate,
      checklist,
    ] = await Promise.all([
      Promise.resolve(generateUACTimelineFromCSV(userData)),
      calculateCommute(userData),
      Promise.resolve(getRentalData(userData.postcode)),
      Promise.resolve(checkBenefitsEligibility({ ...userData, movingForStudy: userData.livingSituation === 'moving_out' })),
      Promise.resolve(calculateFees(userData)),
      Promise.resolve(generateChecklist(userData)),
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
