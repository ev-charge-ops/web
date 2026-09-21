interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_APPLE_SERVICES_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
