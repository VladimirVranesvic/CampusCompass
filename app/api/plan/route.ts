import { NextRequest, NextResponse } from "next/server"
import { generateUACTimelineFromCSV } from "@/lib/data/uac-parser"
import { calculateCommuteRoute } from "@/lib/data/nsw-trip-planner"
import { getRentalDataByPostcode, loadRentalData } from "@/lib/data/rental-parser"

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
  try {
    const allData = loadRentalData('public/data/rentalbond_lodgements_year_2025.xlsx')
    if (allData.length === 0) {
      // Fallback to mock data if file not found or empty
      return getMockRentalData(postcode)
    }
    return getRentalDataByPostcode(allData, postcode)
  } catch (error) {
    console.error('Error loading rental data:', error)
    return getMockRentalData(postcode)
  }
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

function checkBenefitsEligibility(userData: any) {
  // Rule-based eligibility check
  const age = parseInt(userData.age)
  const income = userData.householdIncome
  const livingSituation = userData.livingSituation

  const eligible = []

  // Youth Allowance eligibility
  if (age >= 18 && age < 25) {
    if (income === "under-50k" || income === "50k-100k") {
      eligible.push({
        name: "Youth Allowance",
        eligible: true,
        estimatedAmount: "$300-600 per fortnight",
        nextSteps: [
          "Check eligibility on Services Australia website",
          "Gather required documents (ID, income statements)",
          "Submit application online",
        ],
      })
    } else {
      eligible.push({
        name: "Youth Allowance",
        eligible: false,
        reason: "Household income may be too high",
        nextSteps: ["Check income test thresholds", "Consider part-time work options"],
      })
    }
  }

  // Opal Concession
  eligible.push({
    name: "Opal Concession Card",
    eligible: true,
    estimatedAmount: "50% discount on public transport",
    nextSteps: [
      "Apply through Transport NSW",
      "Provide proof of student status",
      "Collect card from Service NSW",
    ],
  })

  // ABSTUDY (if applicable)
  if (userData.isIndigenous) {
    eligible.push({
      name: "ABSTUDY",
      eligible: true,
      estimatedAmount: "Varies based on circumstances",
      nextSteps: ["Contact Centrelink", "Provide Aboriginal/Torres Strait Islander confirmation"],
    })
  }

  return eligible
}

function calculateFees(userData: any) {
  // Mock fee calculation - replace with actual StudyAssist formulas
  const universities = userData.targetUniversities || []
  const averageAnnualFee = 15000 // Average annual fee in AUD

  return {
    estimatedAnnualFee: averageAnnualFee,
    estimatedTotalFee: averageAnnualFee * 3, // Assuming 3-year degree
    hecsHelp: {
      available: true,
      repaymentThreshold: 51950, // 2024-25 threshold
      estimatedRepayment: "Starts when income exceeds threshold",
    },
    upfrontPayment: {
      discount: "10% discount if paid upfront",
      amount: (averageAnnualFee * 0.9).toFixed(2),
    },
    byUniversity: universities.map((uni: string) => ({
      university: uni,
      estimatedAnnualFee: averageAnnualFee + Math.floor(Math.random() * 5000) - 2500,
    })),
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
      Promise.resolve(checkBenefitsEligibility(userData)),
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
