import type { AgendaEvent } from "@/data/agenda-events";

const MONTHS = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const SHORT = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];
const SITE = "https://wanderwerkhoven-afk.github.io/Fermi-PWA";
const escapeHtml = (value: string) => value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

function eventRange(event: AgendaEvent): { start: number; end: number } | null {
  const index = SHORT.indexOf(String(event.month).toUpperCase());
  const year = Number(event.year), day = Number(event.day);
  if (index < 0 || !Number.isInteger(year) || !Number.isInteger(day) || day < 1 || day > 31) return null;
  const start = Date.UTC(year,index,day);
  const parsed = event.endDate ? /^\d{4}-\d{2}-\d{2}$/.test(event.endDate) ? Date.parse(event.endDate+"T00:00:00Z") : NaN : start;
  return {start,end:Number.isFinite(parsed) && parsed >= start ? parsed : start};
}

export function activitiesForMonth(events: AgendaEvent[], year: number, monthIndex: number): AgendaEvent[] {
  const start = Date.UTC(year,monthIndex,1), end = Date.UTC(year,monthIndex+1,1)-1;
  return events.filter(event => {
    if (event.showInAgenda === false) return false;
    const range = eventRange(event);
    return range !== null && range.start <= end && range.end >= start;
  }).sort((a,b) => (eventRange(a)?.start ?? 0)-(eventRange(b)?.start ?? 0));
}

function imageUrl(event: AgendaEvent): string | null {
  const path = event.detailImagePath || "";
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) return null;
  const normalized = path.startsWith("/Fermi-PWA/") ? path : "/Fermi-PWA"+path;
  // Only allow image paths from our own published repository assets.
  if (!normalized.startsWith("/Fermi-PWA/images/")) return null;
  return SITE.replace("/Fermi-PWA","")+encodeURI(normalized);
}

export function monthlyActivitiesEmail(events: AgendaEvent[], year: number, monthIndex: number): string {
  const month = MONTHS[monthIndex] || MONTHS[0];
  const selected = activitiesForMonth(events,year,monthIndex);
  const cards = selected.length ? selected.map(event => {
    const img = imageUrl(event);
    const date = escapeHtml(event.dateLabel || `${event.day} ${month}`);
    const title = escapeHtml(event.title);
    const time = escapeHtml(event.time || "");
    const location = escapeHtml(event.location || "");
    const link = SITE+"/agenda/activiteit/?slug="+encodeURIComponent(event.slug);
    return `<tr><td style="padding:8px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffe0ad;border-radius:14px"><tr><td class="fermi-event" style="padding:14px">${img ? `<img src="${escapeHtml(img)}" alt="" width="480" style="display:block;width:100%;height:auto;border:0;border-radius:12px;margin-bottom:11px">` : ""}<p style="margin:0 0 5px;color:#c85c21;font-size:13px;font-weight:700">${date}</p><h2 style="margin:0 0 7px;color:#06283b;font:700 21px Georgia,serif">${title}</h2><p style="margin:0 0 11px;color:#233d49;font-size:14px;line-height:1.5">${time} ${time && location ? " • " : ""}${location}</p><a href="${link}" style="display:inline-block;background:#ff792b;color:#06283b;text-decoration:none;font-weight:bold;padding:10px 16px;border-radius:25px;font-size:14px">Bekijk activiteit</a></td></tr></table></td></tr>`;
  }).join("") : '<tr><td style="padding:26px;text-align:center;color:#233d49;background:#ffe0ad;border-radius:16px">Voor deze maand staan nog geen activiteiten gepland.</td></tr>';
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fermi activiteiten in ${month} ${year}</title><style>@media only screen and (max-width:560px){.fermi-wrap{width:100%!important;max-width:100%!important}.fermi-outer{padding:10px 0!important}.fermi-header{padding:18px!important}.fermi-hero{font-size:28px!important}.fermi-content{padding:18px!important}.fermi-month-title{font-size:25px!important}.fermi-event{padding:12px!important}}</style></head><body style="margin:0;background:#f8f0e8;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f0e8"><tr><td align="center" class="fermi-outer" style="padding:14px 10px"><table role="presentation" width="560" class="fermi-wrap" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff5e6"><tr><td class="fermi-header" style="background:#ff792b;padding:20px 26px"><img src="${SITE}/icon.svg" width="48" height="48" alt="S.V. Fermi" style="vertical-align:middle;border:0"> <strong style="color:#06283b;font-size:20px;vertical-align:middle">S.V. Fermi.</strong><p style="text-align:center;font-weight:bold;letter-spacing:2px;color:#06283b;margin:18px 0 8px">HEY FERMION!</p><h1 class="fermi-hero" style="font:italic bold 32px/1.2 Georgia,serif;text-align:center;color:#fff9f0;margin:0 0 12px">Wat staat er deze maand op de planning?</h1></td></tr><tr><td class="fermi-content" style="padding:22px 26px"><p style="font-size:13px;font-weight:bold;letter-spacing:1.5px;color:#c85c21;margin:0 0 8px">WHAT'S ON?</p><h2 class="fermi-month-title" style="font:700 27px Georgia,serif;color:#06283b;margin:0 0 10px;text-transform:capitalize">Activiteiten in ${month} ${year}</h2><p style="font-size:15px;line-height:1.55;color:#233d49;margin:0 0 14px">Ontdek wat S.V. Fermi deze maand organiseert. Bekijk de activiteiten en meld je aan via de app!</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cards}</table><p style="margin:18px 0 0;color:#233d49">Tot snel bij Fermi!<br><strong>Het bestuur van S.V. Fermi</strong></p></td></tr><tr><td style="background:#ff792b;padding:14px;text-align:center;color:#06283b;font-size:12px"><strong>S.V. Fermi</strong><br>Technische Natuurkunde • Hogeschool van Amsterdam</td></tr></table></td></tr></table></body></html>`;
}
