import { notFound } from "next/navigation";
import EventDetailClient from "@/components/events/EventDetailClient";
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
  return <EventDetailClient initialEvent={event} />;
}
