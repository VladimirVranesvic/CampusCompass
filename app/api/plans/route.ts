import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CreatePlanBody } from "@/lib/types/plan"

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("plans")
    .select("id, name, user_data, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error listing plans:", error)
    return NextResponse.json({ error: "Failed to list plans" }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: CreatePlanBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { name, user_data } = body
  if (!name || typeof name !== "string" || !user_data || typeof user_data !== "object") {
    return NextResponse.json(
      { error: "Missing or invalid name or user_data" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("plans")
    .insert({
      user_id: user.id,
      name: name.trim(),
      user_data,
    })
    .select("id, name, user_data, created_at, updated_at")
    .single()

  if (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json({ error: "Failed to save plan" }, { status: 500 })
  }

  return NextResponse.json(data)
}
