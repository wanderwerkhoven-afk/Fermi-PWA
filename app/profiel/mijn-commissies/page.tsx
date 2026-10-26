"use client";
import Link from "next/link";
import { useFermiSession } from "@/components/SessionProvider";
import { committees } from "@/data/committees";
export default function MyCommitteesPage(){
 const {fermiUser}=useFermiSession(); const role=fermiUser?.associationRole||"member";
 const mine=committees.filter(c=>c.slug===role);
 return <main className="app-shell profile-page-shell"><section className="association-admin-panel"><Link href="/profiel">← Terug naar profiel</Link><h1>Mijn commissies</h1>{mine.length?mine.map(c=><Link className="profile-menu-row" href={`/fermi/commissies/${c.slug}`} key={c.slug}><strong>{c.name}</strong><span>{c.description}</span></Link>):<p>Er is nog geen commissie aan je profiel gekoppeld.</p>}<Link href="/fermi">Alle commissies bekijken</Link></section></main>
}