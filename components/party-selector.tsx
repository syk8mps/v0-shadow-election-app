"use client"

import { useState } from "react"
import CandidateSelectorModal from "./candidate-selector-modal"

interface Party {
  id: number
  name: string
  abbreviation: string
  color: string
  logo_url?: string
  display_order?: number
}

interface PartySelectorProps {
  parties: Party[]
  selectedId: number | null
  onChange: (id: number) => void
  onCandidateSelect?: (candidateId: number | null) => void
  disabled?: boolean
  excludePartyId?: number | null
}

export default function PartySelector({
  parties,
  selectedId,
  onChange,
  onCandidateSelect,
  disabled = false,
  excludePartyId = null,
}: PartySelectorProps) {
  const [selectedModalParty, setSelectedModalParty] = useState<Party | null>(null)
  const [showCandidateModal, setShowCandidateModal] = useState(false)

  const displayParties = excludePartyId ? parties.filter((p) => p.id !== excludePartyId) : parties

  // Sort by display_order
  const sortedParties = [...displayParties].sort((a, b) => (a.display_order || 999) - (b.display_order || 999))

  const handlePartyClick = (party: Party) => {
    setSelectedModalParty(party)
    setShowCandidateModal(true)
  }

  const handleCandidateSelect = (candidateId: number) => {
    if (selectedModalParty) {
      onChange(selectedModalParty.id)
      if (onCandidateSelect) {
        onCandidateSelect(candidateId)
      }
    }
  }

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {sortedParties.map((party) => (
          <button
            key={party.id}
            onClick={() => handlePartyClick(party)}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 transition-all text-center font-semibold text-xs ${
              selectedId === party.id ? "border-primary bg-primary/10" : "border-[--color-border] bg-card hover:border-primary/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            title={party.name}
          >
            {party.logo_url ? (
              <img src={party.logo_url || "/placeholder.svg"} alt={party.abbreviation} className="w-8 h-8 mx-auto mb-2 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: party.color }} />
            )}
            <div className="line-clamp-2 text-xs">{party.abbreviation}</div>
          </button>
        ))}
      </div>

      {selectedModalParty && (
        <CandidateSelectorModal
          isOpen={showCandidateModal}
          onClose={() => setShowCandidateModal(false)}
          partyId={selectedModalParty.id}
          partyName={selectedModalParty.name}
          onSelect={handleCandidateSelect}
        />
      )}
    </>
  )
}
