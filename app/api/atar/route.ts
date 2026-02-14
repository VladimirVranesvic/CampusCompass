import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!, 10)
      : new Date().getFullYear()

    const [subjectsRes, scalingRes, conversionRes] = await Promise.all([
      supabase.from("subjects").select("id, name, units").order("name"),
      year
        ? supabase
            .from("scaling_stats")
            .select("id, subject_id, year, percentile, scaled_mark")
            .eq("year", year)
            .order("subject_id")
            .order("percentile")
        : Promise.resolve({ data: [], error: null }),
      year
        ? supabase
            .from("atar_conversion")
            .select("year, aggregate, atar")
            .eq("year", year)
            .order("aggregate", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
    ])

    if (subjectsRes.error) {
      return NextResponse.json(
        { error: "Failed to fetch subjects", details: subjectsRes.error.message },
        { status: 500 }
      )
    }
    if (scalingRes.error) {
      return NextResponse.json(
        { error: "Failed to fetch scaling stats", details: scalingRes.error.message },
        { status: 500 }
      )
    }
    if (conversionRes.error) {
      return NextResponse.json(
        { error: "Failed to fetch ATAR conversion", details: conversionRes.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      subjects: subjectsRes.data ?? [],
      scalingStats: scalingRes.data ?? [],
      atarConversion: conversionRes.data ?? [],
      year,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "ATAR data unavailable", details: message },
      { status: 500 }
    )
  }
}
