"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

type MigrationStatus = "idle" | "loading" | "success" | "error"

export default function MigratePage() {
  const [ipStatus, setIpStatus] = useState<MigrationStatus>("idle")
  const [ipMessage, setIpMessage] = useState("")

  const [expandIpStatus, setExpandIpStatus] = useState<MigrationStatus>("idle")
  const [expandIpMessage, setExpandIpMessage] = useState("")

  const [candidatesStatus, setCandidatesStatus] = useState<MigrationStatus>("idle")
  const [candidatesMessage, setCandidatesMessage] = useState("")

  const runIpMigration = async () => {
    setIpStatus("loading")
    setIpMessage("")

    try {
      const response = await fetch("/api/migrate/add-ip-column", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setIpStatus("success")
        setIpMessage(data.message || "Migratie succesvol uitgevoerd!")
      } else {
        setIpStatus("error")
        setIpMessage(data.error || "Migratie mislukt")
      }
    } catch (error) {
      setIpStatus("error")
      setIpMessage("Er is een fout opgetreden bij het uitvoeren van de migratie")
    }
  }

  const runExpandIpMigration = async () => {
    setExpandIpStatus("loading")
    setExpandIpMessage("")

    try {
      const response = await fetch("/api/migrate/expand-ip-column", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setExpandIpStatus("success")
        setExpandIpMessage(data.message || "IP kolom succesvol uitgebreid!")
      } else {
        setExpandIpStatus("error")
        setExpandIpMessage(data.error || "Migratie mislukt")
      }
    } catch (error) {
      setExpandIpStatus("error")
      setExpandIpMessage("Er is een fout opgetreden bij het uitvoeren van de migratie")
    }
  }

  const runCandidatesMigration = async () => {
    setCandidatesStatus("loading")
    setCandidatesMessage("")

    try {
      const response = await fetch("/api/migrate/seed-all-candidates", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setCandidatesStatus("success")
        setCandidatesMessage(data.message || "Kandidaten succesvol toegevoegd!")
      } else {
        setCandidatesStatus("error")
        setCandidatesMessage(data.error || "Migratie mislukt")
      }
    } catch (error) {
      setCandidatesStatus("error")
      setCandidatesMessage("Er is een fout opgetreden bij het uitvoeren van de migratie")
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar Admin
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Database Migraties</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>IP Tracking Toevoegen</CardTitle>
            <CardDescription>
              Voegt de client_ip kolom toe aan de votes tabel voor IP-gebaseerde stembeveiliging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deze migratie voegt een nieuwe kolom toe aan de database om IP-adressen bij te houden. Dit voorkomt dat
              gebruikers meerdere keren kunnen stemmen vanaf hetzelfde IP-adres.
            </p>

            {ipStatus === "success" && (
              <Alert className="border-green-500 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{ipMessage}</AlertDescription>
              </Alert>
            )}

            {ipStatus === "error" && (
              <Alert className="border-red-500 bg-red-50 text-red-900">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{ipMessage}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={runIpMigration}
              disabled={ipStatus === "loading" || ipStatus === "success"}
              className="w-full"
            >
              {ipStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ipStatus === "success" ? "Migratie Voltooid" : "Migratie Uitvoeren"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IP Kolom Uitbreiden (VEREIST)</CardTitle>
            <CardDescription>
              Vergroot de client_ip kolom om device fingerprints op te slaan - noodzakelijk voor stemmen!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deze migratie vergroot de IP kolom van 45 naar 255 karakters om device fingerprints op te kunnen slaan.
              Dit is noodzakelijk om stemmen mogelijk te maken en om verschillende apparaten op hetzelfde netwerk te
              onderscheiden.
            </p>

            {expandIpStatus === "success" && (
              <Alert className="border-green-500 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{expandIpMessage}</AlertDescription>
              </Alert>
            )}

            {expandIpStatus === "error" && (
              <Alert className="border-red-500 bg-red-50 text-red-900">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{expandIpMessage}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={runExpandIpMigration}
              disabled={expandIpStatus === "loading" || expandIpStatus === "success"}
              className="w-full"
            >
              {expandIpStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {expandIpStatus === "success" ? "IP Kolom Uitgebreid" : "IP Kolom Uitbreiden"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kandidatenlijsten Vullen</CardTitle>
            <CardDescription>Voegt alle kandidaten toe aan de database voor alle partijen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deze migratie voegt 1000+ kandidaten toe aan de database, inclusief alle partijen zoals VVD, PVV, D66,
              GL/PvdA, NSC, BBB, CDA, SP, FVD, DENK, SGP, CU, en meer.
            </p>

            {candidatesStatus === "success" && (
              <Alert className="border-green-500 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{candidatesMessage}</AlertDescription>
              </Alert>
            )}

            {candidatesStatus === "error" && (
              <Alert className="border-red-500 bg-red-50 text-red-900">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{candidatesMessage}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={runCandidatesMigration}
              disabled={candidatesStatus === "loading" || candidatesStatus === "success"}
              className="w-full"
            >
              {candidatesStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {candidatesStatus === "success" ? "Kandidaten Toegevoegd" : "Kandidaten Toevoegen"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
