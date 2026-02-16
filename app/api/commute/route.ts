import { NextRequest, NextResponse } from "next/server"
import { calculateCommuteRoute } from "@/lib/data/nsw-trip-planner"

/**
 * POST /api/commute
 * Body: { postcode: string, universities: string[] }
 * Returns commute data from the given postcode to each university.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const postcode = String(body.postcode ?? "").replace(/\D/g, "").padStart(4, "0")
    const universities = Array.isArray(body.universities) ? body.universities : []

    if (postcode.length !== 4) {
      return NextResponse.json(
        { error: "Valid 4-digit postcode required" },
        { status: 400 }
      )
    }
    if (universities.length === 0) {
      return NextResponse.json(
        { error: "At least one university required" },
        { status: 400 }
      )
    }

    const routes = await Promise.all(
      universities.map(async (uni: string) => {
        try {
          const route = await calculateCommuteRoute(postcode, uni)
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
          return {
            university: uni,
            fromPostcode: postcode,
            travelTime: 45,
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

    return NextResponse.json(routes)
  } catch (error) {
    console.error("Commute API error:", error)
    return NextResponse.json(
      { error: "Failed to calculate commute" },
      { status: 500 }
    )
  }
}
