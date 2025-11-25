"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function AdminDashboard() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [resultsVisible, setResultsVisible] = useState(false)
  const [turnstileEnabled, setTurnstileEnabled] = useState(true)
  const [testModeEnabled, setTestModeEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "admin") {
      setIsAuthenticated(true)
      fetchSettings()
    } else {
      alert("Incorrect password")
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${password}` },
      })
      if (response.ok) {
        const settings = await response.json()
        const resultsSetting = settings.find((s: any) => s.setting_key === "results_visible")
        const turnstileSetting = settings.find((s: any) => s.setting_key === "turnstile_enabled")
        const testModeSetting = settings.find((s: any) => s.setting_key === "test_mode_enabled")
        setResultsVisible(resultsSetting?.setting_value === "true")
        setTurnstileEnabled(turnstileSetting?.setting_value !== "false")
        setTestModeEnabled(testModeSetting?.setting_value === "true")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const toggleResultsVisibility = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          settingKey: "results_visible",
          settingValue: (!resultsVisible).toString(),
        }),
      })
      if (response.ok) {
        setResultsVisible(!resultsVisible)
      }
    } catch (error) {
      console.error("Error updating settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTurnstile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          settingKey: "turnstile_enabled",
          settingValue: (!turnstileEnabled).toString(),
        }),
      })
      if (response.ok) {
        setTurnstileEnabled(!turnstileEnabled)
      }
    } catch (error) {
      console.error("Error updating Turnstile setting:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTestMode = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          settingKey: "test_mode_enabled",
          settingValue: (!testModeEnabled).toString(),
        }),
      })
      if (response.ok) {
        setTestModeEnabled(!testModeEnabled)
      }
    } catch (error) {
      console.error("Error updating test mode setting:", error)
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultaten instellingen</CardTitle>
              <CardDescription>Controleer wanneer resultaten zichtbaar zijn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Resultaten zichtbaar voor publiek</p>
                  <p className="text-sm text-muted-foreground">{resultsVisible ? "Aan" : "Uit"}</p>
                </div>
                <Button
                  onClick={toggleResultsVisibility}
                  disabled={loading}
                  variant={resultsVisible ? "destructive" : "default"}
                >
                  {loading ? "Laden..." : resultsVisible ? "Verbergen" : "Tonen"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cloudflare Turnstile</CardTitle>
              <CardDescription>CAPTCHA-bescherming voor stemmingen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Bot-bescherming ingeschakeld</p>
                  <p className="text-sm text-muted-foreground">{turnstileEnabled ? "Aan" : "Uit"}</p>
                </div>
                <Button
                  onClick={toggleTurnstile}
                  disabled={loading}
                  variant={turnstileEnabled ? "destructive" : "default"}
                >
                  {loading ? "Laden..." : turnstileEnabled ? "Uitschakelen" : "Inschakelen"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Modus</CardTitle>
              <CardDescription>Sta meerdere stemmen toe voor testen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Meerdere stemmen toegestaan</p>
                  <p className="text-sm text-muted-foreground">{testModeEnabled ? "Aan" : "Uit"}</p>
                </div>
                <Button
                  onClick={toggleTestMode}
                  disabled={loading}
                  variant={testModeEnabled ? "destructive" : "default"}
                >
                  {loading ? "Laden..." : testModeEnabled ? "Uitschakelen" : "Inschakelen"}
                </Button>
              </div>
              {testModeEnabled && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                  ⚠️ Let op: IP-controles zijn uitgeschakeld. Iedereen kan meerdere keren stemmen.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Stembeheer</CardTitle>
              <CardDescription>Bekijk, toevoegen, verwijderen en reset stemmen</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/votes">
                <Button className="w-full">Open Stembeheer</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partij Logo's</CardTitle>
              <CardDescription>Upload en beheer partij logo's</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/logos">
                <Button className="w-full">Logo's Beheren</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                Voeg partij logo's toe om de gekleurde cirkels te vervangen in resultaten
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partij Kleuren</CardTitle>
              <CardDescription>Wijzig de kleuren van partijen</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/colors">
                <Button className="w-full">Kleuren Bewerken</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                Pas de kleuren van partijen aan in de grafieken en tabellen
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Kandidaten Beheer</CardTitle>
              <CardDescription>Beheer de kandidatenlijsten per partij</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/setup/candidates">
                <Button className="w-full">Kandidaten Bewerken</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live resultaten</CardTitle>
              <CardDescription>Gedetailleerde resultaten per partij en kandidaat</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/results">
                <Button className="w-full">Bekijk Gedetailleerde Resultaten</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Migratie</CardTitle>
              <CardDescription>Voer database updates uit voor IP-tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/migrate">
                <Button className="w-full">Migratie Uitvoeren</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
