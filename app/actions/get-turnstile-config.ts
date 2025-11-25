"use server"

export async function getTurnstileConfig() {
  return {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null,
  }
}
