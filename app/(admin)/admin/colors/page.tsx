"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Party {
  id: number
  name: string
  abbreviation: string
  color: string
}

export default function AdminColorsPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchParties()
    }
  }, [isAuthenticated])

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

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "admin") {
      setIsAuthenticated(true)
    } else {
      alert("Incorrect password")
    }
  }

  const updatePartyColor = async (partyId: number, newColor: string) => {
    if (!newColor || newColor.length < 4) {
      return
    }

    setSaving(true)
    try {
      console.log("[v0] Updating party", partyId, "to color", newColor)

      const response = await fetch("/api/admin/colors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          partyId,
          color: newColor,
        }),
      })

      const data = await response.json()
      console.log("[v0] Response:", data)

      if (response.ok) {
        setParties(parties.map((p) => (p.id === partyId ? { ...p, color: newColor } : p)))
      } else {
        alert(`Error updating color: ${data.error || "Unknown error"}\n${data.details || ""}`)
      }
    } catch (error) {
      console.error("[v0] Error updating color:", error)
      alert(`Error updating color: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Inloggen</CardTitle>
            <CardDescription>Voer het admin wachtwoord in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md"
              />
              <Button type="submit" className="w-full">
                Inloggen
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Partijen laden...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Terug naar Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Partij Kleuren Bewerken</h1>
          <p className="text-muted-foreground mt-2">
            Wijzig de kleuren van partijen die in grafieken en tabellen gebruikt worden
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parties.map((party) => (
            <Card key={party.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg flex-shrink-0" style={{ backgroundColor: party.color }} />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{party.name}</h3>
                    <p className="text-sm text-muted-foreground">{party.abbreviation}</p>
                    <div className="mt-3 flex gap-2">
                      <input
                        type="color"
                        value={party.color}
                        onChange={(e) => updatePartyColor(party.id, e.target.value)}
                        disabled={saving}
                        className="cursor-pointer h-10 w-24 rounded border border-input"
                      />
                      <input
                        type="text"
                        value={party.color}
                        onChange={(e) => updatePartyColor(party.id, e.target.value)}
                        disabled={saving}
                        className="flex-grow px-2 py-1 text-sm border border-input rounded"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
