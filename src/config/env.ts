import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
  )
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
}
