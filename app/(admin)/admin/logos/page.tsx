"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PartyLogo } from "@/components/party-logo"

interface Party {
  id: number
  name: string
  abbreviation: string
  color: string
  logo_url?: string | null
}

export default function AdminLogosPage() {
  const router = useRouter()
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [adminPassword, setAdminPassword] = useState("")

  useEffect(() => {
    fetchParties()
  }, [])

  const fetchParties = async () => {
    try {
      const response = await fetch("/api/parties")
      if (response.ok) {
        const data = await response.json()
        setParties(data)
      }
    } catch (error) {
      console.error("Error fetching parties:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateLogo = async (partyId: number, logoUrl: string) => {
    if (!adminPassword) {
      alert("Voer eerst het admin wachtwoord in")
      return
    }

    setSaving(partyId)
    try {
      const response = await fetch("/api/parties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, logoUrl: logoUrl.trim() || null, adminPassword }),
      })

      if (response.ok) {
        await fetchParties()
        alert("Logo succesvol bijgewerkt!")
      } else {
        const error = await response.json()
        alert(error.error || "Fout bij het bijwerken van logo")
      }
    } catch (error) {
      console.error("Error updating logo:", error)
      alert("Fout bij het bijwerken van logo")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Partij Logo's Beheren</h1>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Terug naar Dashboard
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin Authenticatie</CardTitle>
            <CardDescription>Voer je admin wachtwoord in om logo's te kunnen bijwerken</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="admin-password">Admin Wachtwoord</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Voer admin wachtwoord in"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                variant={adminPassword ? "default" : "outline"}
                onClick={() => {
                  if (adminPassword) {
                    alert("Wachtwoord ingesteld! Je kunt nu logo's bijwerken.")
                  }
                }}
              >
                {adminPassword ? "✓ Klaar" : "Stel in"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instructies</CardTitle>
            <CardDescription>Hoe partij logo's toevoegen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Volg deze stappen om een logo toe te voegen:</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Upload je logo online (bijvoorbeeld via Imgur, Vercel Blob, of een image hosting service)</li>
              <li>Kopieer de publieke URL van de afbeelding</li>
              <li>Plak de URL in het veld hieronder bij de juiste partij</li>
              <li>Klik op "Opslaan" om het logo toe te voegen</li>
              <li>Laat het veld leeg en klik op "Opslaan" om een logo te verwijderen</li>
            </ol>
            <p className="pt-2 text-xs text-muted-foreground">
              <strong>Tip:</strong> Gebruik vierkante afbeeldingen (bijv. 512x512px) in PNG of SVG formaat voor het
              beste resultaat.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {parties.map((party) => (
            <Card key={party.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <PartyLogo logoUrl={party.logo_url} partyName={party.name} partyColor={party.color} size="lg" />
                  <div>
                    <CardTitle>{party.name}</CardTitle>
                    <CardDescription>{party.abbreviation}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const logoUrl = formData.get("logoUrl") as string
                    updateLogo(party.id, logoUrl)
                  }}
                  className="space-y-3"
                >
                  <div>
                    <Label htmlFor={`logo-${party.id}`}>Logo URL</Label>
                    <Input
                      id={`logo-${party.id}`}
                      name="logoUrl"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      defaultValue={party.logo_url || ""}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={saving === party.id}>
                    {saving === party.id ? "Opslaan..." : "Opslaan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
