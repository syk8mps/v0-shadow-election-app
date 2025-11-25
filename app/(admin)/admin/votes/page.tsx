"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { Trash2, Plus, RotateCcw } from 'lucide-react'

interface Vote {
  id: number
  created_at: string
  user_session_id: string
  vote_party_name: string
  vote_party_abbr: string
  counter_party_name: string
  counter_party_abbr: string
  vote_candidate_name: string | null
  counter_candidate_name: string | null
}

interface Party {
  id: number
  name: string
  abbreviation: string
}

interface Candidate {
  id: number
  name: string
  party_id: number
}

export default function AdminVotesPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [votes, setVotes] = useState<Vote[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)

  const [votePartyId, setVotePartyId] = useState("")
  const [counterPartyId, setCounterPartyId] = useState("")
  const [voteCandidateId, setVoteCandidateId] = useState("")
  const [counterCandidateId, setCounterCandidateId] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "admin") {
      setIsAuthenticated(true)
      fetchData()
    } else {
      alert("Incorrect password")
    }
  }

  const fetchData = async () => {
    await Promise.all([fetchVotes(), fetchParties(), fetchCandidates()])
  }

  const fetchVotes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/votes", {
        headers: { Authorization: `Bearer ${password}` },
      })
      if (response.ok) {
        const data = await response.json()
        setVotes(data.votes || [])
      }
    } catch (error) {
      console.error("Error fetching votes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParties = async () => {
    try {
      const response = await fetch("/api/parties")
      if (response.ok) {
        const data = await response.json()
        setParties(Array.isArray(data) ? data : (data.parties || []))
      }
    } catch (error) {
      console.error("Error fetching parties:", error)
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates/all")
      if (response.ok) {
        const data = await response.json()
        setCandidates(data.candidates || [])
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
    }
  }

  const handleAddVote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!votePartyId || !counterPartyId) {
      alert("Voorstem partij en tegenstem partij zijn verplicht")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          votePartyId: parseInt(votePartyId),
          counterPartyId: parseInt(counterPartyId),
          voteCandidateId: voteCandidateId && voteCandidateId !== "none" ? parseInt(voteCandidateId) : null,
          counterCandidateId: counterCandidateId && counterCandidateId !== "none" ? parseInt(counterCandidateId) : null,
        }),
      })

      if (response.ok) {
        alert("Stem succesvol toegevoegd!")
        setVotePartyId("")
        setCounterPartyId("")
        setVoteCandidateId("")
        setCounterCandidateId("")
        fetchVotes()
      } else {
        alert("Fout bij toevoegen stem")
      }
    } catch (error) {
      console.error("Error adding vote:", error)
      alert("Fout bij toevoegen stem")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVote = async (voteId: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/votes?id=${voteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${password}` },
      })

      if (response.ok) {
        alert("Stem verwijderd!")
        fetchVotes()
      } else {
        alert("Fout bij verwijderen stem")
      }
    } catch (error) {
      console.error("Error deleting vote:", error)
      alert("Fout bij verwijderen stem")
    } finally {
      setLoading(false)
    }
  }

  const handleResetAll = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/votes?resetAll=true", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${password}` },
      })

      if (response.ok) {
        alert("Alle stemmen zijn gereset!")
        fetchVotes()
      } else {
        alert("Fout bij resetten stemmen")
      }
    } catch (error) {
      console.error("Error resetting votes:", error)
      alert("Fout bij resetten stemmen")
    } finally {
      setLoading(false)
    }
  }

  const getVotePartyCandidates = () => {
    if (!votePartyId) return []
    return candidates.filter(c => c.party_id === parseInt(votePartyId))
  }

  const getCounterPartyCandidates = () => {
    if (!counterPartyId) return []
    return candidates.filter(c => c.party_id === parseInt(counterPartyId))
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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Stembeheer</h1>
          <Link href="/admin">
            <Button variant="outline">Terug naar Dashboard</Button>
          </Link>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Reset Alle Stemmen
            </CardTitle>
            <CardDescription>
              Verwijder ALLE stemmen uit de database. Deze actie kan niet ongedaan worden gemaakt!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Alle Stemmen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dit zal ALLE stemmen permanent verwijderen uit de database. Deze actie kan niet
                    ongedaan worden gemaakt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetAll} className="bg-destructive text-destructive-foreground">
                    Ja, verwijder alles
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Handmatig Stem Toevoegen
            </CardTitle>
            <CardDescription>Voeg een stem toe alsof een gebruiker heeft gestemd</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddVote} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voteParty">Voorstem Partij *</Label>
                  <Select value={votePartyId} onValueChange={setVotePartyId}>
                    <SelectTrigger id="voteParty">
                      <SelectValue placeholder="Selecteer partij" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((party) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.abbreviation} - {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voteCandidate">Voorstem Kandidaat (optioneel)</Label>
                  <Select 
                    value={voteCandidateId} 
                    onValueChange={setVoteCandidateId}
                    disabled={!votePartyId}
                  >
                    <SelectTrigger id="voteCandidate">
                      <SelectValue placeholder="Selecteer kandidaat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Geen kandidaat</SelectItem>
                      {getVotePartyCandidates().map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id.toString()}>
                          {candidate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="counterParty">Tegenstem Partij *</Label>
                  <Select value={counterPartyId} onValueChange={setCounterPartyId}>
                    <SelectTrigger id="counterParty">
                      <SelectValue placeholder="Selecteer partij" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((party) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.abbreviation} - {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="counterCandidate">Tegenstem Kandidaat (optioneel)</Label>
                  <Select 
                    value={counterCandidateId} 
                    onValueChange={setCounterCandidateId}
                    disabled={!counterPartyId}
                  >
                    <SelectTrigger id="counterCandidate">
                      <SelectValue placeholder="Selecteer kandidaat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Geen kandidaat</SelectItem>
                      {getCounterPartyCandidates().map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id.toString()}>
                          {candidate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={loading || !votePartyId || !counterPartyId}>
                <Plus className="h-4 w-4 mr-2" />
                Stem Toevoegen
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alle Stemmen ({votes.length})</CardTitle>
            <CardDescription>Overzicht van alle uitgebrachte stemmen</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Laden...</p>
            ) : votes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nog geen stemmen</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">Datum</th>
                      <th className="text-left py-3 px-2">Voorstem</th>
                      <th className="text-left py-3 px-2">Tegenstem</th>
                      <th className="text-left py-3 px-2">Session</th>
                      <th className="text-right py-3 px-2">Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((vote) => (
                      <tr key={vote.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">{vote.id}</td>
                        <td className="py-3 px-2">
                          {new Date(vote.created_at).toLocaleString("nl-NL")}
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <span className="font-semibold">{vote.vote_party_abbr}</span>
                            {vote.vote_candidate_name && (
                              <span className="text-xs text-muted-foreground block">
                                {vote.vote_candidate_name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <span className="font-semibold">{vote.counter_party_abbr}</span>
                            {vote.counter_candidate_name && (
                              <span className="text-xs text-muted-foreground block">
                                {vote.counter_candidate_name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-xs text-muted-foreground">
                          {vote.user_session_id.substring(0, 20)}...
                        </td>
                        <td className="py-3 px-2 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={loading}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Stem verwijderen?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Weet je zeker dat je deze stem wilt verwijderen? Deze actie kan niet
                                  ongedaan worden gemaakt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVote(vote.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Verwijderen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
