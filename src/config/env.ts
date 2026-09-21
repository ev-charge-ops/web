import { z } from 'zod'

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_GOOGLE_CLIENT_ID: optionalString,
  VITE_APPLE_SERVICES_ID: optionalString,
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
  )
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  googleClientId: parsed.data.VITE_GOOGLE_CLIENT_ID,
  appleServicesId: parsed.data.VITE_APPLE_SERVICES_ID,
}
