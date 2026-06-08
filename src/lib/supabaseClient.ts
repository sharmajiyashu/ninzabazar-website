import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()

function cleanEnvValue(value?: string): string {
  if (!value) return ''
  return value.trim().replace(/^["']|["']$/g, '')
}

function isValidSupabaseKey(key: string): boolean {
  if (!key || key.length < 20) return false
  if (key.toLowerCase().includes('placeholder')) return false
  if (key.startsWith('dummy_')) return false
  // Legacy JWT keys
  if (key.startsWith('eyJ')) return true
  // New Supabase API keys
  if (key.startsWith('sb_secret_')) return true
  if (key.startsWith('sb_publishable_')) return true
  return false
}

/** Prefer secret/service role; fall back to publishable key (works with public storage buckets). */
export function getSupabaseAdminKey(): string {
  const candidates = [
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ]

  for (const candidate of candidates) {
    const key = cleanEnvValue(candidate)
    if (isValidSupabaseKey(key)) return key
  }

  return ''
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && getSupabaseAdminKey())
}

export function getSupabaseConfigError(): string | null {
  if (!supabaseUrl) {
    return 'NEXT_PUBLIC_SUPABASE_URL is missing in .env'
  }

  if (!getSupabaseAdminKey()) {
    return (
      'Supabase API key is missing. Set NEXT_PUBLIC_SUPABASE_ANON_KEY (sb_publishable_...) ' +
      'or SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY in your .env file.'
    )
  }

  return null
}

let _supabase: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  const configError = getSupabaseConfigError()
  if (configError) {
    throw new Error(configError)
  }

  if (!_supabase) {
    _supabase = createClient(supabaseUrl, getSupabaseAdminKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return _supabase
}

/** @deprecated use getSupabaseAdmin() */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[
      prop
    ]
  },
})
