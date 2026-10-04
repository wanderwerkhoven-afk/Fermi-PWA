import Link from "next/link";
import { ArrowLeft, Home, Orbit, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="app-shell fermi-404-shell">
      <div className="noise" aria-hidden="true" />

      <section className="fermi-404-card">
        <div className="fermi-404-art" aria-hidden="true">
          <span className="fermi-404-orbit orbit-one" />
          <span className="fermi-404-orbit orbit-two" />
          <span className="fermi-404-core">404</span>
          <Orbit className="fermi-404-atom" size={112} />
          <Sparkles className="fermi-404-spark spark-one" size={28} />
          <Sparkles className="fermi-404-spark spark-two" size={20} />
        </div>

        <div className="fermi-404-copy">
          <span className="fermi-404-kicker">OEPS · DEZE DEELTJES ZIJN VERDWENEN</span>
          <h1>Deze pagina is uit de baan gevlogen.</h1>
          <p>
            We kunnen de pagina die je zoekt niet vinden. Misschien bestaat hij niet meer,
            is de link veranderd, of heeft een verdwaald Fermi-deeltje hem meegenomen.
          </p>

          <div className="fermi-404-actions">
            <Link className="primary-button interactive-control" href="/">
              <Home size={19} />
              Naar Home
            </Link>
            <Link className="fermi-404-secondary interactive-control" href="/agenda">
              <ArrowLeft size={18} />
              Naar Agenda
            </Link>
          </div>

          <small className="fermi-404-footnote">S.V. Fermi · foutcode 404</small>
        </div>
      </section>
    </main>
  );
}
