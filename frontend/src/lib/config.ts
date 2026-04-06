/**
 * Runtime config helper - prevents Turbopack from inlining env vars at build time.
 * Uses Function constructor to avoid static analysis.
 */
function getEnv(key: string): string | undefined {
  return new Function('key', 'return process.env[key]')(key) as string | undefined
}

export function getFastapiUrl(): string {
  return getEnv('FASTAPI_URL') || 'http://localhost:8000'
}
