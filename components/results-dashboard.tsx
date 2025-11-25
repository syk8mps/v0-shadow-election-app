"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartyLogo } from "@/components/party-logo"

interface PartyResult {
  id: number
  name: string
  abbreviation: string
  color: string
  logoUrl?: string | null
  votes: number
  counterVotes: number
  netVotes: number
  seats: number
}

function CustomBarChart({
  data,
  dataKey,
  title,
}: { data: PartyResult[]; dataKey: "seats" | "netVotes"; title: string }) {
  const maxValue = Math.max(...data.map((item) => (dataKey === "seats" ? item.seats : item.netVotes)))

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-start flex-wrap pb-8">
        {data.map((party) => (
          <div key={party.id} className="flex flex-col items-center gap-2 min-w-[80px]">
            <div
              className="w-12 rounded-t flex items-end justify-center transition-all hover:opacity-80"
              style={{
                height: `${((dataKey === "seats" ? party.seats : party.netVotes) / maxValue) * 300}px`,
                backgroundColor: party.color || "var(--primary)",
              }}
            >
              {/* Bar value inside */}
              {dataKey === "seats" ? party.seats : party.netVotes.toFixed(0)}
            </div>
            <div className="flex flex-col items-center gap-1 w-full">
              <PartyLogo logoUrl={party.logoUrl} partyName={party.name} partyColor={party.color} size="sm" />
              <div className="text-[10px] font-bold text-center leading-[12px] text-foreground break-words w-full px-0.5 whitespace-normal">
                {party.abbreviation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResultsDashboard() {
  const [results, setResults] = useState<PartyResult[]>([])
  const [loading, setLoading] = useState(true)
  const [totalVoters, setTotalVoters] = useState(0)
  const [totalSeats] = useState(150)
  const [resultsVisible, setResultsVisible] = useState(false)

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
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/results")
      if (!response.ok) throw new Error("Failed to fetch results")
      const data = await response.json()
      setResults(data.results)
      setTotalVoters(data.totalVoters)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching results:", err)
    }
  }

  if (!resultsVisible) {
    return (
      <Card className="bg-card border-(--color-border)">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Resultaten worden nog niet weergegeven.</p>
          <p className="text-sm text-muted-foreground">
            De beheerder zal de resultaten vrijgeven wanneer het onderzoek is afgerond.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-card border-(--color-border)">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Resultaten laden...</p>
        </CardContent>
      </Card>
    )
  }

  const sortedResults = [...results].sort((a, b) => b.netVotes - a.netVotes)
  const totalSeatsDistributed = sortedResults.reduce((sum, party) => sum + party.seats, 0)

  return (
    <div className="space-y-8">
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
              <p className="text-2xl font-bold text-foreground">{totalVoters > 0 ? (totalVoters * 2).toFixed(0) : 0}</p>
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
            <CustomBarChart data={sortedResults} dataKey="seats" title="Zetels" />
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
            <CustomBarChart data={sortedResults} dataKey="netVotes" title="Stemmen" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-(--color-border)">
        <CardHeader>
          <CardTitle>Gedetailleerde resultaten</CardTitle>
          <CardDescription>Gerangschikt op netto stemmen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border)">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Partij</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Voorstemen</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Tegenstemen</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Netto stemmen</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Zetels</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((party, index) => (
                  <tr
                    key={party.id}
                    className={`border-b border-(--color-border) ${index % 2 === 0 ? "bg-muted/30" : ""}`}
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <PartyLogo logoUrl={party.logoUrl} partyName={party.name} partyColor={party.color} size="sm" />
                        <span>{party.abbreviation}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-foreground">{party.votes}</td>
                    <td className="text-right py-3 px-4 text-foreground">{party.counterVotes}</td>
                    <td className="text-right py-3 px-4 font-semibold text-foreground">{party.netVotes.toFixed(1)}</td>
                    <td className="text-right py-3 px-4 font-bold text-primary">{party.seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
