import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  MapPin,
  Menu,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import EventActions from "@/components/events/EventActions";
import { agendaEvents, getAgendaEvent } from "@/data/agenda-events";

export function generateStaticParams() {
  return agendaEvents.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getAgendaEvent(slug);

  if (!event) notFound();

  return (
    <main className="app-shell event-detail-shell">
      <div className="noise" aria-hidden="true" />

      <header className="event-detail-topbar">
        <Link className="event-back-button" href="/agenda" aria-label="Terug naar agenda">
          <ArrowLeft size={22} />
        </Link>
        <span>Activiteit</span>
        <span className="event-detail-top-spacer" />
      </header>

      <section className={`event-detail-hero agenda-photo-${event.art}`}>
        <div className="event-detail-hero-overlay" />
        <div className="event-detail-date">
          <strong>{event.day}</strong>
          <span>{event.month}</span>
        </div>
        <div className="event-detail-hero-copy">
          <span className="agenda-type">{event.type}</span>
          <h1>{event.title}</h1>
          <p>{event.organizer}</p>
        </div>
      </section>

      <section className="event-detail-content">
        <div className="event-facts-card">
          <div>
            <CalendarDays size={20} />
            <span><small>Datum</small><strong>{event.dateLabel}</strong></span>
          </div>
          <div>
            <Clock3 size={20} />
            <span><small>Tijd</small><strong>{event.time}</strong></span>
          </div>
          <div>
            <MapPin size={20} />
            <span><small>Locatie</small><strong>{event.location}</strong></span>
          </div>
          <div>
            <WalletCards size={20} />
            <span><small>Prijs</small><strong>{event.price}</strong></span>
          </div>
        </div>

        <EventActions initialRegistered={event.registered} capacity={event.capacity} />

        <section className="event-detail-section">
          <span className="event-detail-kicker">OVER DE ACTIVITEIT</span>
          <h2>{event.title}</h2>
          <p>{event.description}</p>
        </section>

        <section className="event-detail-section">
          <span className="event-detail-kicker">PRAKTISCH</span>
          <h2>Goed om te weten</h2>
          <div className="event-practical-list">
            {event.practical.map((item) => (
              <div key={item}>
                <CheckCircle2 size={19} />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="event-detail-section event-registration-info">
          <span className="event-detail-kicker">INSCHRIJVEN</span>
          <h2>Deadline</h2>
          <p>{event.registrationDeadline}</p>
        </section>
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/">
          <Home size={23} />
          <span>Home</span>
        </Link>
        <Link className="nav-item active" href="/agenda">
          <CalendarDays size={23} />
          <span>Agenda</span>
          <i />
        </Link>
        <a className="nav-item center-item" href="#">
          <span className="nav-fermi"><Menu size={14} /><span>Fermi</span></span>
          <span>Fermi</span>
        </a>
        <a className="nav-item" href="#"><UsersRound size={25} /><span>Community</span></a>
        <a className="nav-item" href="#"><UserRound size={24} /><span>Profiel</span></a>
      </nav>
    </main>
  );
}
