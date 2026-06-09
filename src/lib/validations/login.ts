import { z } from 'zod'

/** Shared email/password login schema — used by buyer and seller login forms. */
export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
})

export type LoginDto = z.infer<typeof loginSchema>
