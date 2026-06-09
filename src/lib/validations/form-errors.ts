import type { ZodError } from 'zod'

/** Map a Zod validation error to field-level messages for forms. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const flattened = error.flatten()
  const next: Record<string, string> = {}

  for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
    const msg = Array.isArray(messages) ? messages[0] : messages
    if (typeof msg === 'string') next[key] = msg
  }

  return next
}
