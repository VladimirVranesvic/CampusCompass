import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton for client components and libs (e.g. geocoding) that need a single instance
export const supabase = createClient()
