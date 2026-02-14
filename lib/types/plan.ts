// Matches the plans table and API payloads

export interface SavedPlan {
  id: string
  user_id: string
  name: string
  user_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CreatePlanBody {
  name: string
  user_data: Record<string, unknown>
}

export interface UpdatePlanBody {
  name?: string
  user_data?: Record<string, unknown>
}
