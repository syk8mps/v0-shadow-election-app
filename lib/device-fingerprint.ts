// Device fingerprinting system to prevent vote fraud without accounts
export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server-side"

  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width + "x" + screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency || 0,
  ]

  const fingerprint = components.join("|")
  const encoder = new TextEncoder()
  const data = encoder.encode(fingerprint)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  return forwarded?.split(",")[0] || realIP || "unknown"
}

export function combineIPAndFingerprint(ip: string, fingerprint: string): string {
  return `${ip}_${fingerprint}`
}
