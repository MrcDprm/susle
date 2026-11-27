const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Turnstile jetonunu Cloudflare'e sorar. Ağ hatasında da false döner; şüphede süs asılmaz.
export async function verifyTurnstile(
  token: string,
  ip: string | null,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return false
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  try {
    const res = await fetcher(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: unknown }
    return data.success === true
  } catch {
    return false
  }
}
