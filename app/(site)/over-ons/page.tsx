import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Linkedin, Facebook } from "lucide-react"

export default function AboutPage() {
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
            <Link href="/toekomstvisie">
              <Button variant="outline">Toekomstvisie</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Over ons</h2>

          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Wij zijn studenten van Mandeville Academy, waar we werken aan maatschappelijke vraagstukken en innovatie.
              We voeren opdrachten uit voor organisaties zoals Shell, Tata Steel, Talpa Networks, de gemeente Gouda en
              ASML, en we werken samen met Penn State University. Daarnaast ontvangen we geregeld politici, onder wie
              Mark Rutte, Bart De Wever en Jan Peter Balkenende.
            </p>
            <p>
              Wij presenteren De Tegenstem. Hiermee willen we een genuanceerdere verkiezingsaanpak ontwikkelen, af van strategisch stemmen en polarisatie, en werken aan een hogere opkomst en een beter functionerende politiek.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
            </p>
          </div>

          <Link href="/stem" className="mt-12">
            <Button size="lg">Naar de stempagina</Button>
          </Link>

          <div className="mt-20 pt-12 border-t border-border">
            <h3 className="text-2xl font-bold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5" />
                <a href="tel:+31612345678" className="hover:text-foreground transition-colors">
                  {"+31 6 51550424"}
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <a
                  href="mailto:info@schaduwverkiezing.nl"
                  className="hover:text-foreground transition-colors font-mono"
                >
                  {"Merijn@Mandevilleacademy.nl"}
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Linkedin className="h-5 w-5" />
                <a
                  href="https://www.linkedin.com/company/schaduwverkiezing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  LinkedIn
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Facebook className="h-5 w-5" />
                <a
                  href="https://www.facebook.com/schaduwverkiezing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
