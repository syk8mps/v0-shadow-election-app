"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Candidate {
  id: number
  name: string
  voorstemmen: number
  tegenstemmen: number
}

interface PartyResults {
  partyId: number
  partyName: string
  partyAbbreviation: string
  totalVoorstemmen: number
  totalTegenstemmen: number
  nettovotes: number
  zetels: number
  candidates: Candidate[]
}

export default function AdminResultsPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [results, setResults] = useState<PartyResults[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedParty, setExpandedParty] = useState<number | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "admin") {
      setIsAuthenticated(true)
      fetchDetailedResults()
    } else {
      alert("Incorrect password")
    }
  }

  const fetchDetailedResults = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/results", {
        headers: { Authorization: `Bearer ${password}` },
      })
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
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
              <Input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Live Resultaten - Admin View</h1>
          <Link href="/admin">
            <Button variant="outline">Terug naar Dashboard</Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Stemmen per Partij en Kandidaat</CardTitle>
            <CardDescription>Gedetailleerde breakdown van voorstemmen en tegenstemmen per kandidaat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((party) => (
                <div key={party.partyId} className="border border-[--color-border] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedParty(expandedParty === party.partyId ? null : party.partyId)}
                    className="w-full p-4 flex justify-between items-center hover:bg-muted/50 transition"
                  >
                    <div className="text-left">
                      <p className="font-bold">{party.partyName} ({party.partyAbbreviation})</p>
                      <p className="text-sm text-muted-foreground">
                        Voorstemmen: {party.totalVoorstemmen} | Tegenstemmen: {party.totalTegenstemmen} | Netto: {party.nettovotes.toFixed(1)} | Zetels: {party.zetels}
                      </p>
                    </div>
                    <span className="text-2xl">{expandedParty === party.partyId ? "−" : "+"}</span>
                  </button>

                  {expandedParty === party.partyId && (
                    <div className="p-4 bg-muted/30 border-t border-[--color-border]">
                      {party.candidates && party.candidates.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[--color-border]">
                                <th className="text-left py-2 px-2 font-semibold">Kandidaat</th>
                                <th className="text-right py-2 px-2 font-semibold">Voorstemmen</th>
                                <th className="text-right py-2 px-2 font-semibold">Tegenstemmen</th>
                              </tr>
                            </thead>
                            <tbody>
                              {party.candidates.map((candidate) => (
                                <tr key={candidate.id} className="border-b border-[--color-border]">
                                  <td className="py-2 px-2">{candidate.name}</td>
                                  <td className="text-right py-2 px-2">{candidate.voorstemmen}</td>
                                  <td className="text-right py-2 px-2">{candidate.tegenstemmen}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">Geen kandidaatgegevens beschikbaar</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {loading && <p className="text-center text-muted-foreground mt-4">Laden...</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
