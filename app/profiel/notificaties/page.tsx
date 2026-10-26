"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { collection,doc,onSnapshot,query,updateDoc,where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFermiSession } from "@/components/SessionProvider";
type Notice={id:string;title?:string;message?:string;body?:string;read?:boolean;createdAt?:{seconds:number}};
export default function NotificationsPage(){
 const {firebaseUser}=useFermiSession();const [items,setItems]=useState<Notice[]>([]);const [error,setError]=useState("");
 useEffect(()=>{if(!firebaseUser){setItems([]);return;}return onSnapshot(query(collection(db,"notifications"),where("userId","==",firebaseUser.uid)),s=>setItems(s.docs.map((d):Notice=>({...(d.data() as Omit<Notice,"id">),id:d.id})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))),()=>setError("Meldingen laden is niet gelukt."));},[firebaseUser]);
 return <main className="app-shell profile-page-shell"><section className="association-admin-panel"><Link href="/profiel">← Terug naar profiel</Link><h1>Notificaties</h1><p>Je recente meldingen en geschiedenis.</p>{error&&<p role="alert">{error}</p>}{items.length===0?<p>Je hebt nog geen meldingen.</p>:items.map(n=><article className="profile-menu-row" key={n.id}><div><strong>{n.title||"Fermi melding"}</strong><p>{n.message||n.body||""}</p><small>{n.createdAt?.seconds?new Date(n.createdAt.seconds*1000).toLocaleString("nl-NL"):""}</small></div>{!n.read&&<button onClick={()=>updateDoc(doc(db,"notifications",n.id),{read:true,readAt:new Date()}).catch(()=>setError("Markeren als gelezen is mislukt."))}>Gelezen</button>}</article>)}</section></main>
}