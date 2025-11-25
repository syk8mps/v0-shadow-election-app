"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import VotingInterface from "@/components/voting-interface"

export default function VotingPage() {
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkIfVoted = async () => {
      try {
        const response = await fetch("/api/votes/check")
        if (response.ok) {
          const data = await response.json()
          if (data.hasVoted) {
            router.push("/resultaten")
            return
          }
        }
      } catch (error) {
        console.error("Vote check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkIfVoted()
  }, [router])

  const handleVoteSuccess = () => {
    router.push("/resultaten")
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
              <Link href="/over-ons">
                <Button variant="outline">Over ons</Button>
              </Link>
              <Link href="/toekomstvisie">
                <Button variant="outline">Toekomstvisie</Button>
              </Link>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </main>
    )
  }

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
            <Link href="/over-ons">
              <Button variant="outline">Over ons</Button>
            </Link>
            <Link href="/toekomstvisie">
              <Button variant="outline">Toekomstvisie</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Stem nu</h2>
          <p className="text-muted-foreground mb-8">Selecteer je voorstem en tegenstem</p>
          <VotingInterface onVoteSuccess={handleVoteSuccess} />
        </div>
      </section>
    </main>
  )
}
