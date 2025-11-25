"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PartySelector from "./party-selector"
import { Turnstile } from "@marsidev/react-turnstile"
import { getTurnstileConfig } from "@/app/actions/get-turnstile-config"
import { generateDeviceFingerprint } from "@/lib/device-fingerprint"

interface Party {
  id: number
  name: string
  abbreviation: string
  color: string
}

interface VotingInterfaceProps {
  onVoteSuccess: () => void
}

export default function VotingInterface({ onVoteSuccess }: VotingInterfaceProps) {
  const [parties, setParties] = useState<Party[]>([])
  const [voteParty, setVoteParty] = useState<number | null>(null)
  const [counterParty, setCounterParty] = useState<number | null>(null)
  const [voteCandidate, setVoteCandidate] = useState<number | null>(null)
  const [counterCandidate, setCounterCandidate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileEnabled, setTurnstileEnabled] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null)
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("")

  useEffect(() => {
    fetchParties()
    fetchSettings()
    fetchTurnstileConfig()
    generateDeviceFingerprint().then(setDeviceFingerprint)
  }, [])

  useEffect(() => {
    if (deviceFingerprint) {
      checkVoteStatus()
    }
  }, [deviceFingerprint])

  const fetchParties = async () => {
    try {
      const response = await fetch("/api/parties")
      if (!response.ok) throw new Error("Failed to fetch parties")
      const data = await response.json()
      setParties(data)
    } catch (err) {
      setError(`Fout bij het laden van partijen: ${err instanceof Error ? err.message : "onbekende fout"}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/public")
      if (response.ok) {
        const data = await response.json()
        setTurnstileEnabled(data.turnstile_enabled !== "false")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      setTurnstileEnabled(true) // Default to enabled
    }
  }

  const checkVoteStatus = async () => {
    try {
      const response = await fetch(`/api/votes/check?fingerprint=${deviceFingerprint}`)
      if (response.ok) {
        const data = await response.json()
        setHasVoted(data.hasVoted)
      }
    } catch (error) {
      console.error("Error checking vote status:", error)
    }
  }

  const fetchTurnstileConfig = async () => {
    try {
      const config = await getTurnstileConfig()
      setTurnstileSiteKey(config.siteKey)
    } catch (error) {
      console.error("Error fetching Turnstile config:", error)
    }
  }

  const handleSubmit = async () => {
    if (hasVoted) {
      return
    }

    if (!voteParty || !counterParty) {
      setError("Selecteer beide een voorstem en tegenstem")
      return
    }

    if (voteParty === counterParty) {
      setError("Voorstem en tegenstem moeten verschillende partijen zijn")
      return
    }

    if (turnstileEnabled && !turnstileToken) {
      setError("Voltooi de veiligheidscontrole")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          votePartyId: voteParty,
          counterPartyId: counterParty,
          voteCandidateId: voteCandidate,
          counterCandidateId: counterCandidate,
          turnstileToken: turnstileEnabled ? turnstileToken : null,
          deviceFingerprint,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.alreadyVoted) {
          setHasVoted(true)
          setSubmitting(false)
          return
        }

        if (data.redirect) {
          window.location.href = data.redirect
          return
        }
        setError(`Fout: ${data.error || "Stem kon niet worden ingediend"}`)
        setSubmitting(false)
        return
      }

      onVoteSuccess()
    } catch (err) {
      setError("Fout bij het indienen van je stem")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-(--color-border)">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Partijen laden...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="bg-card border-(--color-border)">
        <CardHeader>
          <CardTitle>Mijn voorstem</CardTitle>
          <CardDescription>Welke partij zou jij het liefste zien regeren?</CardDescription>
        </CardHeader>
        <CardContent>
          <PartySelector
            parties={parties}
            selectedId={voteParty}
            onChange={setVoteParty}
            onCandidateSelect={setVoteCandidate}
            disabled={submitting}
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-(--color-border)">
        <CardHeader>
          <CardTitle>Mijn tegenstem</CardTitle>
          <CardDescription>Met welke partij ben je het het minst eens?</CardDescription>
        </CardHeader>
        <CardContent>
          <PartySelector
            parties={parties}
            selectedId={counterParty}
            onChange={setCounterParty}
            onCandidateSelect={setCounterCandidate}
            disabled={submitting || voteParty === null}
            excludePartyId={voteParty}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {turnstileEnabled && (
        <Card className="bg-card border-(--color-border)">
          <CardHeader>
            <CardTitle>Veiligheidscontrole</CardTitle>
            <CardDescription>Bevestig dat je geen robot bent</CardDescription>
          </CardHeader>
          <CardContent>
            {turnstileSiteKey ? (
              <Turnstile
                siteKey={turnstileSiteKey}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                options={{
                  theme: "light",
                  size: "normal",
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Veiligheidscontrole is niet geconfigureerd</p>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!voteParty || !counterParty || (turnstileEnabled && !turnstileToken) || submitting || hasVoted}
        size="lg"
        className="w-full"
      >
        {submitting ? "Stem wordt ingediend..." : "Mijn stem indienen"}
      </Button>
    </div>
  )
}
