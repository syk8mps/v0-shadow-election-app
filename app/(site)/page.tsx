import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Navigation */}
      <nav className="bg-card border-b border-(--color-border) sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80">Schaduwverkiezing 2025</h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/stem">
              <Button variant="default">Stemmen</Button>
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

      {/* Hero Section */}
      <section className="py-20 px-4 md:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">{"Dubbel de democratie"}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Participeer in de schaduwverkiezing van de Tweede Kamer 2025. Stem met voorstem én tegenstem.
          </p>
          <Link href="/stem">
            <Button size="lg" className="px-8 py-6 text-lg">
              Nu stemmen
            </Button>
          </Link>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-16 px-4 md:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Voorstem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Kies de partij die jij het liefste zou zien regeren. Dit telt als +1 stem.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tegenstem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Kies de partij waar je het minst mee eens bent. Dit telt als -0,5 stem.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jouw invloed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Samen bepalen we wat de werkelijke voorkeur van het Nederlandse volk is.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
