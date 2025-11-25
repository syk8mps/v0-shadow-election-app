import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function VisionPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Navigation */}
      <nav className="bg-card border-b border-(--color-border) sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80">Schaduwverkiezing 2025</h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
            <Link href="/stem">
              <Button variant="default">Stemmen</Button>
            </Link>
            <Link href="/over-ons">
              <Button variant="outline">Over ons</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Onze toekomstvisie</h2>

          <div className="space-y-8 text-lg text-muted-foreground">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Schaduwverkiezingen</h3>
              <p>Wij houden 10 - 18 maart schaduwverkiezingen tegelijkertijd met de gemeenteraadverkiezingen.</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Implimentatie</h3>
              <p>
                Als er blijkt dat het volk de tegenstem terug wil zien in de politiek, stappen wij naar de 2e kamer met ons voorstel.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Transparantie</h3>
              <p>
                Wij hopen, dat eens de tegenstem geimplementeerd is, de opkomst naar de verkiezingen met zo'n 6-8% verhoogd, en de kamer een genuanceerd en accuraat beeld van wat mensen écht willen zien in de politiek.k denkt.
              </p>
            </div>
          </div>

          <Link href="/stem" className="mt-12">
            <Button size="lg">Doe mee met de schaduwverkiezing</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
