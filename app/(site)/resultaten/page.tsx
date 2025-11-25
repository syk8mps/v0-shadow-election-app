"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PartyResult {
  id: number
  name: string
  abbreviation: string
  color: string
  votes: number
  counterVotes: number
  netVotes: number
  seats: number
  candidates?: Array<{
    id: number
    name: string
    voorstemmen: number
    tegenstemmen: number
  }>
}

function SimpleBarChart({ data, dataKey }: { data: PartyResult[]; dataKey: "seats" | "netVotes" }) {
  const maxValue = Math.max(...data.map((item) => (dataKey === "seats" ? item.seats : item.netVotes)))

  return (
    <div className="flex gap-3 justify-start flex-wrap pb-8 overflow-x-auto">
      {data.map((party) => (
        <div key={party.id} className="flex flex-col items-center gap-2 min-w-[60px]">
          <div
            className="w-10 rounded-t flex items-end justify-center text-white font-bold text-xs transition-all hover:opacity-80"
            style={{
              height: `${((dataKey === "seats" ? party.seats : party.netVotes) / maxValue) * 250}px`,
              backgroundColor: party.color || "var(--primary)",
              minHeight: "20px",
            }}
          >
            {dataKey === "seats" ? party.seats : Math.round(party.netVotes)}
          </div>
          <div className="text-[10px] font-bold text-center text-foreground break-words w-full whitespace-normal">
            {party.abbreviation}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ResultsPage() {
  const [results, setResults] = useState<PartyResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalVoters, setTotalVoters] = useState(0)
  const [totalSeats, setTotalSeats] = useState(150)
  const [resultsVisible, setResultsVisible] = useState(true)
  const [expandedParty, setExpandedParty] = useState<number | null>(null)

  useEffect(() => {
    fetchSettings()
    fetchResults()
    const interval = setInterval(fetchResults, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/public")
      if (response.ok) {
        const data = await response.json()
        setResultsVisible(data.results_visible === "true")
      }
    } catch (error) {
      console.error("Error fetching visibility settings:", error)
      setResultsVisible(true)
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/results")
      if (!response.ok) {
        throw new Error("Failed to fetch results")
      }
      const data = await response.json()
      setResults(data.results || [])
      setTotalVoters(data.totalVoters || 0)
      setTotalSeats(data.totalSeats || 150)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error("Error fetching results:", err)
      setError(err instanceof Error ? err.message : "Fout bij laden resultaten")
      setLoading(false)
      setResults([])
      setTotalVoters(0)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <nav className="bg-card border-b border-(--color-border) sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80">Schaduwverkiezing 2025</h1>
            </Link>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
            </div>
          </div>
        </nav>

        <section className="py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-card border-(--color-border)">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Resultaten laden...</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <nav className="bg-card border-b border-(--color-border) sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80">Schaduwverkiezing 2025</h1>
            </Link>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
            </div>
          </div>
        </nav>

        <section className="py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-card border-(--color-border)">
              <CardContent className="p-12 text-center space-y-4">
                <p className="text-destructive mb-4">Er is een fout opgetreden bij het laden van de resultaten.</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={fetchResults}>Opnieuw proberen</Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    )
  }

  if (!resultsVisible) {
    return (
      <main className="min-h-screen bg-background">
        <nav className="bg-card border-b border-(--color-border) sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80">Schaduwverkiezing 2025</h1>
            </Link>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
            </div>
          </div>
        </nav>

        <section className="py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-card border-(--color-border)">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">Resultaten worden nog niet weergegeven.</p>
                <p className="text-sm text-muted-foreground">
                  De beheerder zal de resultaten vrijgeven wanneer het onderzoek is afgerond.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    )
  }

  const sortedResults = [...results].sort((a, b) => b.netVotes - a.netVotes)
  const totalSeatsDistributed = sortedResults.reduce((sum, party) => sum + party.seats, 0)

  return (
    <main className="min-h-screen bg-background">
      <nav className="bg-card border-b border-(--color-border) sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80">Schaduwverkiezing 2025</h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="bg-card border-(--color-border)">
            <CardHeader>
              <CardTitle>Samenvatting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Totale deelnemers</p>
                  <p className="text-2xl font-bold text-foreground">{totalVoters}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Partijen</p>
                  <p className="text-2xl font-bold text-foreground">{results.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Totale stemmen</p>
                  <p className="text-2xl font-bold text-foreground">{totalVoters > 0 ? totalVoters : 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Zetels verdeeld</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalSeatsDistributed}/{totalSeats}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-(--color-border)">
            <CardHeader>
              <CardTitle>Zetelverdeling (D'Hondt-methode)</CardTitle>
              <CardDescription>Geschatte zetels per partij in de Tweede Kamer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <SimpleBarChart data={sortedResults} dataKey="seats" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-(--color-border)">
            <CardHeader>
              <CardTitle>Stemmen per partij</CardTitle>
              <CardDescription>Netto stemmen (voorstem - tegenstem × 0,5)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <SimpleBarChart data={sortedResults} dataKey="netVotes" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-(--color-border)">
            <CardHeader>
              <CardTitle>Gedetailleerde resultaten per partij</CardTitle>
              <CardDescription>Gerangschikt op netto stemmen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedResults.map((party) => (
                  <div key={party.id} className="border border-(--color-border) rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedParty(expandedParty === party.id ? null : party.id)}
                      className="w-full p-4 flex justify-between items-center hover:bg-muted/50 transition"
                    >
                      <div className="text-left flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: party.color }} />
                        <div>
                          <p className="font-bold">{party.abbreviation}</p>
                          <p className="text-sm text-muted-foreground">
                            Voorstemmen: {party.votes} | Tegenstemmen: {party.counterVotes} | Netto:{" "}
                            {party.netVotes.toFixed(1)} | Zetels: {party.seats}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl">{expandedParty === party.id ? "−" : "+"}</span>
                    </button>

                    {expandedParty === party.id && party.candidates && party.candidates.length > 0 && (
                      <div className="p-4 bg-muted/30 border-t border-(--color-border)">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-(--color-border)">
                              <th className="text-left py-2 px-2 font-semibold">Kandidaat</th>
                              <th className="text-right py-2 px-2 font-semibold">Voorstemmen</th>
                              <th className="text-right py-2 px-2 font-semibold">Tegenstemmen</th>
                            </tr>
                          </thead>
                          <tbody>
                            {party.candidates.map((candidate) => (
                              <tr key={candidate.id} className="border-b border-(--color-border)">
                                <td className="py-2 px-2">{candidate.name}</td>
                                <td className="text-right py-2 px-2">{candidate.voorstemmen}</td>
                                <td className="text-right py-2 px-2">{candidate.tegenstemmen}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
