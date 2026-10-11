import { notFound } from "next/navigation";
import { committees, getCommittee } from "@/data/committees";
import CommitteeDetailClient from "@/components/committees/CommitteeDetailClient";

export function generateStaticParams() {
  return committees.map((committee) => ({ slug: committee.slug }));
}

export default async function CommitteePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const committee = getCommittee(slug);
  if (!committee) notFound();
  return <CommitteeDetailClient baseCommittee={committee} />;
}
