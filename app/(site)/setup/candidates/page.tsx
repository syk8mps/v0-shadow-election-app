"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Party {
  id: number
  name: string
  abbreviation: string
}

interface Candidate {
  id: number
  name: string
  position: number
  party_id: number
  party_name?: string
}

export default function CandidatesManagementPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedPartyId, setSelectedPartyId] = useState<string>("")
  const [candidateName, setCandidateName] = useState("")
  const [candidatePosition, setCandidatePosition] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchParties()
    fetchAllCandidates()
  }, [])

  const fetchParties = async () => {
    try {
      const response = await fetch("/api/parties")
      if (!response.ok) throw new Error("Failed to fetch parties")
      const data = await response.json()
      setParties(data)
    } catch (err) {
      console.error("[v0] Error fetching parties:", err)
      setError("Fout bij het laden van partijen")
    }
  }

  const fetchAllCandidates = async () => {
    try {
      const response = await fetch("/api/candidates/all")
      if (response.ok) {
        const data = await response.json()
        setCandidates(Array.isArray(data) ? data : data.candidates || [])
      }
    } catch (err) {
      console.error("Error fetching candidates:", err)
    }
  }

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedPartyId || !candidateName.trim()) {
      setError("Selecteer een partij en voer een kandidaatnaam in")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyId: Number.parseInt(selectedPartyId),
          name: candidateName.trim(),
          position: candidatePosition ? Number.parseInt(candidatePosition) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add candidate")
      }

      setSuccess(`Kandidaat ${candidateName} succesvol toegevoegd!`)
      setCandidateName("")
      setCandidatePosition("")
      fetchAllCandidates()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij toevoegen kandidaat")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCandidate = async (candidateId: number) => {
    if (!confirm("Weet je zeker dat je deze kandidaat wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(`/api/candidates?id=${candidateId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete candidate")

      setSuccess("Kandidaat verwijderd")
      fetchAllCandidates()
    } catch (err) {
      setError("Fout bij verwijderen kandidaat")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="bg-card border-b border-(--color-border) sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/admin">
            <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80">Kandidaten Beheer</h1>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Terug naar Admin</Button>
          </Link>
        </div>
      </nav>

      <section className="py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Kandidaat toevoegen</CardTitle>
              <CardDescription>Voeg kandidaten toe aan partijen voor de verkiezing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="party">Partij</Label>
                  <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                    <SelectTrigger id="party">
                      <SelectValue placeholder="Selecteer een partij" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((party) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.name} ({party.abbreviation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Kandidaatnaam</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Bijv. Jan Jansen"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Positie op lijst (optioneel)</Label>
                  <Input
                    id="position"
                    type="number"
                    placeholder="Bijv. 1, 2, 3..."
                    value={candidatePosition}
                    onChange={(e) => setCandidatePosition(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg">
                    <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Toevoegen..." : "Kandidaat toevoegen"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alle kandidaten</CardTitle>
              <CardDescription>Overzicht van alle toegevoegde kandidaten</CardDescription>
            </CardHeader>
            <CardContent>
              {!Array.isArray(candidates) || candidates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nog geen kandidaten toegevoegd</p>
              ) : (
                <div className="space-y-4">
                  {parties.map((party) => {
                    const partyCandidates = candidates.filter((c) => c.party_id === party.id)
                    if (partyCandidates.length === 0) return null

                    return (
                      <div key={party.id} className="border border-(--color-border) rounded-lg p-4">
                        <h3 className="font-semibold mb-3">
                          {party.name} ({party.abbreviation})
                        </h3>
                        <div className="space-y-2">
                          {partyCandidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="flex justify-between items-center p-2 bg-muted/30 rounded"
                            >
                              <div>
                                <span className="font-medium">{candidate.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  (Positie: {candidate.position})
                                </span>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCandidate(candidate.id)}
                              >
                                Verwijder
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
