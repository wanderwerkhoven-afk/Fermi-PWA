import Link from "next/link";
import { ArrowLeft, Home, Orbit, Sparkles, Users } from "lucide-react";

export default function NotFound() {
  return (
    <main className="app-shell fermi-404-shell">
      <div className="noise" aria-hidden="true" />
      <section className="fermi-404-card" aria-labelledby="fermi-404-title">
        <div className="fermi-404-art" aria-hidden="true">
          <span className="fermi-404-orbit orbit-one" />
          <span className="fermi-404-orbit orbit-two" />
          <span className="fermi-404-core">404</span>
          <Orbit className="fermi-404-atom" size={112} />
          <Sparkles className="fermi-404-spark spark-one" size={28} />
          <Sparkles className="fermi-404-spark spark-two" size={20} />
        </div>
        <div className="fermi-404-copy">
          <span className="fermi-404-kicker">S.V. FERMI · VERDWAALD IN HET UNIVERSUM</span>
          <h1 id="fermi-404-title">Oeps! Buiten onze baan.</h1>
          <p>
            Deze pagina is helaas uit haar baan geschoten. De link is misschien
            veranderd of de pagina bestaat niet meer. Geen zorgen: we helpen je
            terug naar Fermi!
          </p>
          <nav className="fermi-404-actions" aria-label="Terug naar Fermi">
            <Link className="primary-button interactive-control" href="/">
              <Home size={19} aria-hidden="true" />
              Naar Home
            </Link>
            <Link className="fermi-404-secondary interactive-control" href="/agenda">
              <ArrowLeft size={18} aria-hidden="true" />
              Agenda
            </Link>
            <Link className="fermi-404-secondary interactive-control" href="/fermi">
              <Users size={18} aria-hidden="true" />
              Vereniging
            </Link>
          </nav>
          <small className="fermi-404-footnote">S.V. Fermi · Error 404 · Er is hier geen deeltje te vinden.</small>
        </div>
      </section>
    </main>
  );
}
