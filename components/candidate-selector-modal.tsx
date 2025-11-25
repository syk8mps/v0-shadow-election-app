"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Candidate {
  id: number
  name: string
  position: number
  party_id: number
}

interface CandidateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  partyId: number
  partyName: string
  onSelect: (candidateId: number) => void
}

export default function CandidateSelectorModal({
  isOpen,
  onClose,
  partyId,
  partyName,
  onSelect,
}: CandidateSelectorModalProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchCandidates()
    }
  }, [isOpen, partyId])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/candidates?partyId=${partyId}`)
      console.log("[v0] Candidates API response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Candidates API error:", response.status, errorText)
        throw new Error(`Failed to fetch candidates: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("[v0] Candidates received:", data?.length)
      setCandidates(data || [])
    } catch (error) {
      console.error("[v0] Error fetching candidates:", error)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kies een kandidaat van {partyName}</DialogTitle>
          <DialogDescription>
            Selecteer de kandidaat van deze partij voor je voorstem of tegenstem
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground">Kandidaten laden...</p>
        ) : candidates.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {candidates.map((candidate) => (
              <Button
                key={candidate.id}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => {
                  onSelect(candidate.id)
                  onClose()
                }}
              >
                <div>
                  <div className="font-semibold">{candidate.name}</div>
                  <div className="text-xs text-muted-foreground">Positie: {candidate.position}</div>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm">Geen kandidaten beschikbaar</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
