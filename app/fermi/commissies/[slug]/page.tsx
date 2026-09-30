import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Home,
  Megaphone,
  Plane,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import CommitteeSignup from "@/components/committees/CommitteeSignup";
import { committees, getCommittee } from "@/data/committees";

export function generateStaticParams() {
  return committees.map((committee) => ({ slug: committee.slug }));
}

const iconMap = {
  users: UsersRound,
  education: GraduationCap,
  plane: Plane,
  megaphone: Megaphone,
};

export default async function CommitteePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const committee = getCommittee(slug);

  if (!committee) notFound();

  const Icon = iconMap[committee.icon];

  return (
    <main className="app-shell committee-detail-shell">
      <div className="noise" aria-hidden="true" />

      <section className="committee-detail-hero">
        <header className="committee-detail-topbar">
          <Link className="event-back-button" href="/fermi" aria-label="Terug naar Fermi">
            <ArrowLeft size={22} />
          </Link>

          <div className="brand committee-detail-brand">
            <div className="fermi-mark" aria-hidden="true">
              <span className="fermi-mark-line line-one" />
              <span className="fermi-mark-line line-two" />
              <span className="fermi-mark-circle">Fermi</span>
            </div>
            <span>SV Fermi</span>
          </div>

          <button className="icon-button notification-button" aria-label="Meldingen">
            <Bell size={21} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="committee-detail-title">
          <span className="committee-detail-kicker">{committee.colorLabel}</span>
          <h1>{committee.name}</h1>
          <p>{committee.fullName}</p>

          <div className={`committee-detail-art committee-detail-art-${committee.art}`} aria-hidden="true">
            <span className="committee-detail-orange-disc" />
            <span className="committee-detail-icon"><Icon size={54} /></span>
            <span className="committee-detail-dots" />
          </div>
        </div>
      </section>

      <section className="committee-detail-content">
        <section className="committee-intro-card">
          <span className="committee-intro-icon"><Icon size={27} /></span>
          <div>
            <span className="committee-label">OVER DE COMMISSIE</span>
            <h2>{committee.fullName}</h2>
            <p>{committee.intro}</p>
          </div>
        </section>

        <CommitteeSignup committeeName={committee.name} />

        <section className="committee-detail-section">
          <span className="committee-label">WAT GA JE DOEN?</span>
          <h2>Dit doet {committee.name}</h2>
          <div className="committee-check-list">
            {committee.activities.map((item) => (
              <div key={item}><CheckCircle2 size={19} /><span>{item}</span></div>
            ))}
          </div>
        </section>

        <section className="committee-detail-section committee-skills-section">
          <span className="committee-label">WAT LEER JE?</span>
          <h2>Skills die je ontwikkelt</h2>
          <div className="committee-skill-grid">
            {committee.learn.map((skill) => (
              <span key={skill}><Sparkles size={16} />{skill}</span>
            ))}
          </div>
        </section>

        <section className="committee-detail-section">
          <span className="committee-label">PAST DIT BIJ JOU?</span>
          <h2>Deze commissie is iets voor jou als…</h2>
          <div className="committee-check-list">
            {committee.idealFor.map((item) => (
              <div key={item}><CheckCircle2 size={19} /><span>{item}</span></div>
            ))}
          </div>
        </section>

        <section className="committee-commitment-card">
          <Clock3 size={24} />
          <div>
            <span className="committee-label">TIJDSINVESTERING</span>
            <p>{committee.commitment}</p>
          </div>
        </section>

        <CommitteeSignup committeeName={committee.name} />
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/"><Home size={23} /><span>Home</span></Link>
        <Link className="nav-item" href="/agenda"><CalendarDays size={23} /><span>Agenda</span></Link>
        <Link className="nav-item center-item active" href="/fermi">
          <span className="nav-fermi">
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span><i />
        </Link>
        <Link className="nav-item" href="/community"><UsersRound size={25} /><span>Community</span></Link>
        <Link className="nav-item" href="/profiel"><UserRound size={24} /><span>Profiel</span></Link>
      </nav>
    </main>
  );
}
