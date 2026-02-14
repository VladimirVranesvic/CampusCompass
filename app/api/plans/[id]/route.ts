import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("plans")
    .select("id, name, user_data, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    if (error?.code === "PGRST116") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }
    console.error("Error fetching plan:", error)
    return NextResponse.json({ error: "Failed to load plan" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { name?: string; user_data?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const updates: { name?: string; user_data?: Record<string, unknown> } = {}
  if (body.name != null) updates.name = String(body.name).trim()
  if (body.user_data != null && typeof body.user_data === "object") updates.user_data = body.user_data
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("plans")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, user_data, created_at, updated_at")
    .single()

  if (error || !data) {
    if (error?.code === "PGRST116") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }
    console.error("Error updating plan:", error)
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("plans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }
    console.error("Error deleting plan:", error)
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
