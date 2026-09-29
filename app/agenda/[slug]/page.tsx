import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  CalendarRange,
  Coins,
  Home,
  MapPin,
  Menu,
  Plane,
  Share2,
  UserRound,
  UsersRound,
  Wine,
} from "lucide-react";
import EventActions from "@/components/events/EventActions";
import { agendaEvents, getAgendaEvent } from "@/data/agenda-events";

export function generateStaticParams() {
  return agendaEvents.map((event) => ({ slug: event.slug }));
}

function FermiMark() {
  return (
    <div className="fermi-mark event-fermi-mark" aria-hidden="true">
      <span className="fermi-mark-line line-one" />
      <span className="fermi-mark-line line-two" />
      <span className="fermi-mark-circle">Fermi</span>
    </div>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getAgendaEvent(slug);

  if (!event) notFound();

  const isTravel = event.detailVariant === "travel" && event.travel;

  if (isTravel) {
    return (
      <main className="app-shell travel-detail-shell">
        <div className="noise" aria-hidden="true" />

        <header className="travel-topbar">
          <Link className="event-back-button" href="/agenda" aria-label="Terug naar agenda">
            <ArrowLeft size={22} />
          </Link>

          <div className="travel-brand">
            <FermiMark />
            <strong>SV Fermi</strong>
          </div>

          <button className="event-back-button" aria-label="Deel activiteit">
            <Share2 size={21} />
          </button>
        </header>

        <section className="travel-collage-hero">
          <div className="travel-paper-title">
            <span>Studiereis</span>
            <strong>Budapest ’25</strong>
          </div>

          <div className="travel-hero-photo travel-photo-city" />
          <div className="travel-polaroid">
            <div className="travel-polaroid-photo" />
          </div>

          <div className="travel-stamp">
            <b>BUDAPEST</b>
            <span>✦</span>
          </div>

          <Plane className="travel-plane" size={45} />
          <span className="travel-route-dash" />
          <span className="travel-orange-scribble" />
        </section>

        <section className="travel-content">
          <div className="travel-primary-facts">
            <div>
              <span className="travel-icon-bubble"><CalendarRange size={24} /></span>
              <span><strong>{event.travel.dateRange}</strong><small>Datum</small></span>
            </div>
            <div>
              <span className="travel-icon-bubble"><MapPin size={26} /></span>
              <span><strong>{event.travel.destination}</strong><small>Locatie</small></span>
            </div>
          </div>

          <p className="travel-intro">{event.description}</p>

          <div className="travel-info-grid">
            <article>
              <span className="travel-icon-bubble"><Plane size={24} /></span>
              <div><h3>Vervoer</h3><p>{event.travel.transport}</p></div>
            </article>
            <article>
              <span className="travel-icon-bubble"><BedDouble size={24} /></span>
              <div><h3>Verblijf</h3><p>{event.travel.stay}</p></div>
            </article>
            <article>
              <span className="travel-icon-bubble"><Coins size={24} /></span>
              <div><h3>Prijsindicatie</h3><p>{event.travel.priceIndication}</p></div>
            </article>
            <article>
              <span className="travel-icon-bubble"><CalendarDays size={24} /></span>
              <div><h3>Inschrijfdeadline</h3><p>{event.travel.signupDeadline}</p></div>
            </article>
          </div>

          <EventActions
            initialRegistered={event.registered}
            capacity={event.capacity}
            shareTitle={event.title}
          />

          <section className="travel-expectations">
            <h2>Wat kun je verwachten?<span aria-hidden="true">✦</span></h2>
            <div>
              <p><span className="travel-icon-bubble small"><Building2 size={18} /></span>{event.travel.expectations[0]}</p>
              <p><span className="travel-icon-bubble small"><UsersRound size={18} /></span>{event.travel.expectations[1]}</p>
              <p><span className="travel-icon-bubble small"><Wine size={18} /></span>{event.travel.expectations[2]}</p>
            </div>
          </section>
        </section>

        <nav className="bottom-nav" aria-label="Hoofdnavigatie">
          <Link className="nav-item" href="/"><Home size={23} /><span>Home</span></Link>
          <Link className="nav-item active" href="/agenda"><CalendarDays size={23} /><span>Agenda</span><i /></Link>
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
          <div><CalendarDays size={20} /><span><small>Datum</small><strong>{event.dateLabel}</strong></span></div>
          <div><MapPin size={20} /><span><small>Locatie</small><strong>{event.location}</strong></span></div>
        </div>

        <EventActions initialRegistered={event.registered} capacity={event.capacity} shareTitle={event.title} />

        <section className="event-detail-section">
          <span className="event-detail-kicker">OVER DE ACTIVITEIT</span>
          <h2>{event.title}</h2>
          <p>{event.description}</p>
        </section>
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/"><Home size={23} /><span>Home</span></Link>
        <Link className="nav-item active" href="/agenda"><CalendarDays size={23} /><span>Agenda</span><i /></Link>
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
