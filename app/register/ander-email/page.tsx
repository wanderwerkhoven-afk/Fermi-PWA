"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerWithAlternativeEmail } from "../../../lib/services/auth";
import styles from "../register.module.css";

type Data = { email:string; firstName:string; prefix:string; lastName:string; pronouns:string; study:string; studyYear:string; phone:string; password:string; confirm:string };
const initial:Data={email:"",firstName:"",prefix:"",lastName:"",pronouns:"",study:"Technische Natuurkunde",studyYear:"",phone:"",password:"",confirm:""};

export default function AlternativeRegisterPage(){
 const router=useRouter();
 const [step,setStep]=useState(1);
 const [data,setData]=useState(initial);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [show,setShow]=useState(false);
 const [errors,setErrors]=useState<Partial<Record<keyof Data,string>>>({});
 const [emailExists,setEmailExists]=useState(false);
 const set=(key:keyof Data,value:string)=>{setData(v=>({...v,[key]:value}));setErrors(v=>({...v,[key]:undefined}));if(key==="email")setEmailExists(false)};
 const emailValid=data.email.trim()!==""&&/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email);
 const yearNumber=Number(data.studyYear);
 const studyYearValid=data.studyYear!==""&&Number.isInteger(yearNumber)&&yearNumber>=2000&&yearNumber<=2100;
 const checked=(valid:boolean)=><Check className={styles.fieldCheck} aria-hidden="true"/>;


 function next(e:FormEvent){
   e.preventDefault();
   setMessage("");
   const nextErrors:Partial<Record<keyof Data,string>>={};
   if(step===1){
     if(!data.email.trim()) nextErrors.email="Vul je e-mailadres in om verder te gaan.";
     else if(!emailValid) nextErrors.email="Dit lijkt geen geldig e-mailadres. Controleer of @ en de domeinnaam kloppen.";
     if(!data.firstName.trim()) nextErrors.firstName="Vul je voornaam in om verder te gaan.";
     if(!data.lastName.trim()) nextErrors.lastName="Vul je achternaam in om verder te gaan.";
   }
   if(step===2&&data.studyYear&&!studyYearValid) nextErrors.studyYear="Vul een geldig startjaar in tussen 2000 en 2100.";
   if(step===3){
     if(data.password.length<8) nextErrors.password="Gebruik minimaal 8 tekens voor je wachtwoord.";
     if(!data.confirm) nextErrors.confirm="Herhaal je wachtwoord.";
     else if(data.password!==data.confirm) nextErrors.confirm="De wachtwoorden zijn niet hetzelfde.";
   }
   if(Object.keys(nextErrors).length){setErrors(nextErrors);return;}
   setErrors({});
   setStep(s=>Math.min(4,s+1));
 }

 async function create(){
   setBusy(true);
   setMessage("");
   try{
     await registerWithAlternativeEmail(data.email,data.password,{
       firstName:data.firstName,
       prefix:data.prefix,
       lastName:data.lastName,
       pronouns:data.pronouns,
       study:data.study,
       studyYear:data.studyYear?Number(data.studyYear):null,
       phone:data.phone
     });
     router.push("/");
   }catch(err){
     console.error(err);
     const code=(err as {code?:string}).code;
     if(code==="auth/email-already-in-use"){setEmailExists(true);setErrors({email:"Er bestaat al een Fermi-account met dit e-mailadres."});setStep(1);setMessage("");}
     else if(code==="auth/invalid-email"){setErrors({email:"Dit e-mailadres is niet geldig. Controleer het adres en probeer opnieuw."});setStep(1);}
     else if(code==="auth/weak-password"){setErrors({password:"Dit wachtwoord is te zwak. Gebruik minimaal 8 tekens."});setStep(3);}
     else if(code==="auth/network-request-failed"){setMessage("Geen verbinding met Fermi. Controleer je internetverbinding en probeer opnieuw.");}
     else if(code==="auth/too-many-requests"){setMessage("Er zijn te veel pogingen gedaan. Wacht even en probeer het daarna opnieuw.");}
     else{setMessage("Account maken is niet gelukt. Controleer je gegevens en probeer opnieuw.");}
   }finally{
     setBusy(false);
   }
 }

 return <main className={styles.page}><section className={styles.shell}>
  <header className={styles.header}><img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="S.V. Fermi"/><div><small>ACCOUNT MAKEN</small><strong>Welkom bij Fermi</strong></div></header>
  <div className={styles.progress}>{[1,2,3,4].map(n=><span key={n} className={n<=step?styles.on:""}>{n<step?<Check/>:n}</span>)}</div>
  <form className={styles.card} onSubmit={next} noValidate>
   {step===1&&<><small>Stap 1 van 4</small><h1>Jouw account</h1><p>Gebruik het persoonlijke e-mailadres waarmee je jouw Fermi-account wilt aanmaken.</p><label>E-mailadres<div className={styles.inputShell}><input type="email" value={data.email} onChange={e=>set("email",e.target.value)} placeholder="naam@voorbeeld.nl" required/>{emailValid&&checked(true)}</div>{errors.email&&<span className={styles.fieldError} role="alert">{errors.email}</span>}{emailExists&&<span className={styles.fieldHelp}>Ga naar <Link href="/login">inloggen</Link> of gebruik daar ‘Wachtwoord vergeten?’.</span>}</label><div className={styles.altLogin}><span>Heb je toch nog een HvA e-mailadres?</span><Link href="/register">Account maken met HvA e-mailadres <ArrowRight /></Link></div><div className={styles.two}><label>Voornaam<div className={styles.inputShell}><input value={data.firstName} onChange={e=>set("firstName",e.target.value)} required/>{data.firstName.trim()!==""&&checked(true)}</div>{errors.firstName&&<span className={styles.fieldError} role="alert">{errors.firstName}</span>}</label><label>Tussenvoegsel<div className={styles.inputShell}><input value={data.prefix} onChange={e=>set("prefix",e.target.value)}/>{data.prefix.trim()!==""&&checked(true)}</div></label></div><label>Achternaam<div className={styles.inputShell}><input value={data.lastName} onChange={e=>set("lastName",e.target.value)} required/>{data.lastName.trim()!==""&&checked(true)}</div>{errors.lastName&&<span className={styles.fieldError} role="alert">{errors.lastName}</span>}</label></>}
   {step===2&&<><small>Stap 2 van 4</small><h1>Over jou</h1><p>Deze gegevens kun je later altijd aanpassen.</p><label>Pronouns <em>optioneel</em><div className={styles.inputShell}><input value={data.pronouns} onChange={e=>set("pronouns",e.target.value)} placeholder="bijv. hij/hem, zij/haar, die/hen"/>{data.pronouns.trim()!==""&&checked(true)}</div></label><label>Telefoon <em>optioneel</em><div className={styles.inputShell}><input type="tel" value={data.phone} onChange={e=>set("phone",e.target.value)} placeholder="06 12345678"/>{data.phone.trim()!==""&&checked(true)}</div></label><label>Startjaar studie<div className={styles.inputShell}><input type="number" min="2000" max="2100" value={data.studyYear} onChange={e=>set("studyYear",e.target.value)} placeholder="bijv. 2024"/>{studyYearValid&&checked(true)}</div>{errors.studyYear&&<span className={styles.fieldError} role="alert">{errors.studyYear}</span>}</label></>}
   {step===3&&<><small>Stap 3 van 4</small><h1>Beveiliging</h1><p>Kies een wachtwoord voor je Fermi-account.</p><label>Wachtwoord<div className={styles.password}><input type={show?"text":"password"} value={data.password} onChange={e=>set("password",e.target.value)} minLength={8} required/>{data.password.length>=8&&checked(true)}<button type="button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff/>:<Eye/>}</button></div>{errors.password&&<span className={styles.fieldError} role="alert">{errors.password}</span>}</label><label>Herhaal wachtwoord<div className={styles.inputShell}><input type={show?"text":"password"} value={data.confirm} onChange={e=>set("confirm",e.target.value)} required/>{data.confirm!==""&&data.confirm===data.password&&checked(true)}</div>{errors.confirm&&<span className={styles.fieldError} role="alert">{errors.confirm}</span>}</label></>}
   {step===4&&<><small>Stap 4 van 4</small><h1>Klopt alles?</h1><p>Na het aanmaken sturen we een verificatielink naar dit e-mailadres.</p><dl className={styles.review}><div><dt>Naam</dt><dd>{[data.firstName,data.prefix,data.lastName].filter(Boolean).join(" ")}</dd></div><div><dt>E-mail</dt><dd>{data.email}</dd></div><div><dt>Pronouns</dt><dd>{data.pronouns||"—"}</dd></div><div><dt>Opleiding</dt><dd>Technische Natuurkunde</dd></div><div><dt>Startjaar studie</dt><dd>{data.studyYear||"—"}</dd></div><div><dt>Telefoon</dt><dd>{data.phone||"—"}</dd></div></dl></>}
   {message&&<p className={styles.message}>{message}</p>}
   <div className={styles.actions}>{step>1?<button type="button" className={styles.back} onClick={()=>setStep(s=>s-1)}><ArrowLeft/>Terug</button>:<Link className={styles.back} href="/register"><ArrowLeft/>HvA e-mail</Link>}{step<4?<button className={styles.next}>Verder<ArrowRight/></button>:<button type="button" className={styles.next} disabled={busy} onClick={()=>void create()}>{busy?"Account maken…":"Account maken"}<ArrowRight/></button>}</div>
  </form>
 </section></main>
}
