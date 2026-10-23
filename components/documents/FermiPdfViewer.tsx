"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  ListTree,
  Minus,
  Plus,
  X,
} from "lucide-react";

function resolveBasePath() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.startsWith("/Fermi-PWA") ? "/Fermi-PWA" : "";
}

function resolvePdfUrl() {
  return `${resolveBasePath()}/documents/beleidsplan-fermi-2026-2027.pdf`;
}

function resolveWorkerUrl() {
  return `${resolveBasePath()}/vendor/pdfjs/pdf.worker.min.mjs`;
}

type TocItem = {
  title: string;
  page: number | null;
  depth: number;
};


const FERMI_BELEIDSPLAN_TOC: TocItem[] = [
  { title: "Voorwoord", page: 3, depth: 0 },
  { title: "Inhoudsopgave", page: 4, depth: 0 },
  { title: "1. Inleiding", page: 6, depth: 0 },

  { title: "2. Missie, Visie & Waarden", page: 7, depth: 0 },
  { title: "2.1 Missie", page: 7, depth: 1 },
  { title: "2.2 Visie", page: 7, depth: 1 },
  { title: "2.3 Waarden", page: 7, depth: 1 },

  { title: "3. Doelen & Strategieën", page: 9, depth: 0 },
  { title: "3.1 Doelen", page: 9, depth: 1 },
  { title: "3.2 Strategieën", page: 10, depth: 1 },

  { title: "4. Organisatiestructuur", page: 12, depth: 0 },
  { title: "4.1 Het Bestuur", page: 12, depth: 1 },
  { title: "4.2 Commissies", page: 13, depth: 1 },
  { title: "4.3 Algemene Ledenvergadering", page: 14, depth: 1 },

  { title: "5. Activiteiten", page: 15, depth: 0 },
  { title: "5.1 Hoofddoelen van Activiteiten", page: 15, depth: 1 },
  { title: "5.2 Activiteitenoverzicht", page: 15, depth: 1 },
  { title: "5.3 Evaluatie en Feedback", page: 16, depth: 1 },

  { title: "6. Lidmaatschap", page: 17, depth: 0 },
  { title: "6.1 Lidmaatschapsvoordelen", page: 17, depth: 1 },
  { title: "6.2 Lidmaatschap Vereisten", page: 17, depth: 1 },
  { title: "6.3 Lidmaatschapskosten", page: 17, depth: 1 },
  { title: "6.4 Aanmeldingsprocedure", page: 17, depth: 1 },
  { title: "6.5 Lidmaatschap ‘Vrienden van Fermi’", page: 18, depth: 1 },
  { title: "6.6 Alumni Lidmaatschap", page: 18, depth: 1 },
  { title: "6.7 Docenten Lidmaatschap", page: 18, depth: 1 },
  { title: "6.8 Beëindiging van Lidmaatschap", page: 18, depth: 1 },
  { title: "6.9 Lidmaatschap Verplichtingen", page: 18, depth: 1 },

  { title: "7. Communicatie & Marketing", page: 19, depth: 0 },
  { title: "7.1 Communicatiestrategieën", page: 19, depth: 1 },
  { title: "7.2 Marketingactiviteiten", page: 19, depth: 1 },
  { title: "7.3 Gebruik van Sociale Media", page: 19, depth: 1 },
  { title: "Evaluatie en Feedback", page: 19, depth: 1 },

  { title: "8. Financiën", page: 21, depth: 0 },
  { title: "8.1 Inkomstenbronnen", page: 21, depth: 1 },
  { title: "8.2 Uitgaven", page: 21, depth: 1 },
  { title: "8.3 Financieel Beheer", page: 21, depth: 1 },
  { title: "8.4 Evaluatie van Financiën", page: 22, depth: 1 },

  { title: "9. Samenwerkingen", page: 23, depth: 0 },
  { title: "9.1 Samenwerkingen binnen de Opleiding", page: 23, depth: 1 },
  { title: "9.2 Samenwerkingen met Bedrijven", page: 23, depth: 1 },
  { title: "9.3 Samenwerkingen met Andere Studieverenigingen", page: 23, depth: 1 },
  { title: "9.4 Samenwerkingen met Alumni", page: 24, depth: 1 },
  { title: "9.5 Toekomstige Samenwerkingen", page: 24, depth: 1 },

  { title: "10. Sponsoring", page: 25, depth: 0 },
  { title: "10.1 Sponsoring als Toekomstige Bron van Financiering", page: 25, depth: 1 },
  { title: "10.2 Potentiële Sponsormogelijkheden", page: 25, depth: 1 },
  { title: "10.3 Sponsoring strategie", page: 25, depth: 1 },
  { title: "10.4 Waarborgen van de Verenigingswaarden", page: 25, depth: 1 },

  { title: "11. Toekomstvisie", page: 26, depth: 0 },
  { title: "11.1 Groei en Uitbreiding van de Vereniging", page: 26, depth: 1 },
  { title: "11.2 Professionalisering van Bestuur en Commissies", page: 26, depth: 1 },
  { title: "11.3 Samenwerkingen en Netwerken", page: 26, depth: 1 },
  { title: "11.4 Financiële Duurzaamheid", page: 27, depth: 1 },
  { title: "11.5 Innovatie en Flexibiliteit", page: 27, depth: 1 },

  { title: "12. Bijlagen", page: 28, depth: 0 },
  { title: "12.1 Financiële Begroting", page: 28, depth: 1 },
  { title: "12.2 Privacy Statement", page: 29, depth: 1 },
  { title: "12.3 Alcoholbeleid", page: 29, depth: 1 },
  { title: "12.4 Drugsbeleid", page: 31, depth: 1 },
  { title: "12.5 Gedragscode", page: 32, depth: 1 },
];

type PdfOutlineItem = NonNullable<Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>>[number];

async function outlineItemPage(pdf: PDFDocumentProxy, item: PdfOutlineItem): Promise<number | null> {
  if (!item.dest) return null;

  const destination = typeof item.dest === "string"
    ? await pdf.getDestination(item.dest)
    : item.dest;

  if (!destination?.length) return null;

  const first = destination[0];
  if (typeof first === "number") return first + 1;

  if (first && typeof first === "object" && "num" in first) {
    return (await pdf.getPageIndex(first)) + 1;
  }

  return null;
}

async function flattenOutline(pdf: PDFDocumentProxy, items: PdfOutlineItem[], depth = 0): Promise<TocItem[]> {
  const result: TocItem[] = [];

  for (const item of items) {
    result.push({
      title: item.title || "Onderdeel",
      page: await outlineItemPage(pdf, item),
      depth,
    });

    if (item.items?.length) {
      result.push(...await flattenOutline(pdf, item.items, depth + 1));
    }
  }

  return result;
}

export default function FermiPdfViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const renderIdRef = useRef(0);
  const pinchRef = useRef<{
    active: boolean;
    startDistance: number;
    startZoom: number;
  }>({ active: false, startDistance: 0, startZoom: 1 });

  const swipeRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startedAt: number;
  }>({ active: false, startX: 0, startY: 0, startedAt: 0 });

  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [tocOpen, setTocOpen] = useState(false);

  const renderPage = useCallback(async (nextPage = pageNumber, nextZoom = zoom) => {
    const pdf = documentRef.current;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!pdf || !canvas || !stage) return;

    const renderId = ++renderIdRef.current;
    setRendering(true);

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        try {
          await renderTaskRef.current.promise;
        } catch {
          // Expected when a previous render is cancelled for a newer render.
        }
        renderTaskRef.current = null;
      }

      const page = await pdf.getPage(nextPage);
      if (renderId !== renderIdRef.current) return;

      const baseViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(stage.clientWidth - 28, 280);
      const fitScale = Math.min(availableWidth / baseViewport.width, 1.55);
      const cssScale = fitScale * nextZoom;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const renderViewport = page.getViewport({ scale: cssScale * pixelRatio });

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is niet beschikbaar.");

      canvas.width = Math.floor(renderViewport.width);
      canvas.height = Math.floor(renderViewport.height);
      canvas.style.width = `${Math.floor(baseViewport.width * cssScale)}px`;
      canvas.style.height = `${Math.floor(baseViewport.height * cssScale)}px`;

      context.clearRect(0, 0, canvas.width, canvas.height);
      const renderTask = page.render({ canvasContext: context, viewport: renderViewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      if (renderTaskRef.current === renderTask) {
        renderTaskRef.current = null;
      }
    } catch (cause) {
      const cancelled = cause instanceof Error && (
        cause.name === "RenderingCancelledException"
        || cause.message.includes("Rendering cancelled")
      );

      if (!cancelled && renderId === renderIdRef.current) {
        console.error(cause);
        setError("Deze pagina kon niet worden weergegeven.");
      }
    } finally {
      if (renderId === renderIdRef.current) setRendering(false);
    }
  }, [pageNumber, zoom]);

  useEffect(() => {
    let active = true;

    async function loadPdf() {
      setLoading(true);
      setError("");

      try {
        GlobalWorkerOptions.workerSrc = resolveWorkerUrl();
        const pdf = await getDocument(resolvePdfUrl()).promise;
        if (!active) return;

        documentRef.current = pdf;
        setPageCount(pdf.numPages);
        setPageNumber(1);

        const outline = await pdf.getOutline();
        if (active) {
          if (outline?.length) {
            setToc(await flattenOutline(pdf, outline));
          } else {
            setToc(FERMI_BELEIDSPLAN_TOC);
          }
        }

        setLoading(false);
      } catch (cause) {
        console.error(cause);
        if (active) {
          setError("De PDF-preview kon niet worden geladen.");
          setLoading(false);
        }
      }
    }

    void loadPdf();

    return () => {
      active = false;
      renderIdRef.current += 1;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!loading && !error && pageCount > 0) {
      void renderPage(pageNumber, zoom);
    }
  }, [error, loading, pageCount, pageNumber, renderPage, zoom]);

  useEffect(() => {
    if (!stageRef.current || typeof ResizeObserver === "undefined") return;

    let timer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (documentRef.current) void renderPage(pageNumber, zoom);
      }, 120);
    });

    observer.observe(stageRef.current);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [pageNumber, renderPage, zoom]);

  function previousPage() {
    setPageNumber((current) => Math.max(1, current - 1));
  }

  function nextPage() {
    setPageNumber((current) => Math.min(pageCount, current + 1));
  }

  function zoomOut() {
    setZoom((current) => Math.max(0.7, Number((current - 0.15).toFixed(2))));
  }

  function zoomIn() {
    setZoom((current) => Math.min(2.2, Number((current + 0.15).toFixed(2))));
  }

  function touchDistance(touches: React.TouchList) {
    if (touches.length < 2) return 0;
    const first = touches[0];
    const second = touches[1];
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    if (event.touches.length === 2) {
      swipeRef.current.active = false;
      pinchRef.current = {
        active: true,
        startDistance: touchDistance(event.touches),
        startZoom: zoom,
      };
      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      swipeRef.current = {
        active: zoom <= 1.02,
        startX: touch.clientX,
        startY: touch.clientY,
        startedAt: Date.now(),
      };
    }
  }

  function handleTouchMove(event: React.TouchEvent<HTMLElement>) {
    if (!pinchRef.current.active || event.touches.length !== 2) return;

    const distance = touchDistance(event.touches);
    if (!distance || !pinchRef.current.startDistance) return;

    event.preventDefault();

    const ratio = distance / pinchRef.current.startDistance;
    const nextZoom = Math.min(
      2.2,
      Math.max(0.7, Number((pinchRef.current.startZoom * ratio).toFixed(2))),
    );

    const visualScale = nextZoom / pinchRef.current.startZoom;
    if (canvasWrapRef.current) {
      canvasWrapRef.current.style.transform = `scale(${visualScale})`;
    }
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (pinchRef.current.active && event.touches.length < 2) {
      const remainingTouch = event.touches[0] ?? event.changedTouches[0];
      void remainingTouch;

      const wrap = canvasWrapRef.current;
      const transform = wrap?.style.transform || "";
      const match = transform.match(/scale\(([^)]+)\)/);
      const visualScale = match ? Number(match[1]) : 1;
      const nextZoom = Math.min(
        2.2,
        Math.max(0.7, Number((pinchRef.current.startZoom * visualScale).toFixed(2))),
      );

      pinchRef.current.active = false;

      if (wrap) {
        wrap.style.transform = "";
      }

      setZoom(nextZoom);
    }

    if (!swipeRef.current.active || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - swipeRef.current.startX;
    const dy = touch.clientY - swipeRef.current.startY;
    const elapsed = Date.now() - swipeRef.current.startedAt;

    swipeRef.current.active = false;

    const horizontalEnough = Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.35;
    const quickEnough = elapsed <= 700;
    const pageSwipeAllowed = zoom <= 1.02 && !pinchRef.current.active;

    if (!pageSwipeAllowed || !horizontalEnough || !quickEnough || rendering) return;

    if (dx < 0 && pageNumber < pageCount) {
      setPageNumber((current) => Math.min(pageCount, current + 1));
      stageRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } else if (dx > 0 && pageNumber > 1) {
      setPageNumber((current) => Math.max(1, current - 1));
      stageRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }

  function goToTocPage(page: number | null) {
    if (!page) return;
    setPageNumber(Math.min(pageCount, Math.max(1, page)));
    setTocOpen(false);
    stageRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  return (
    <main className="fermi-pdf-page">
      <header className="fermi-pdf-header">
        <Link className="fermi-pdf-back" href="/fermi" aria-label="Terug naar Fermi">
          <ArrowLeft size={22} />
        </Link>
        <div className="fermi-pdf-title">
          <small>DOCUMENTEN</small>
          <h1>Beleidsplan</h1>
          <p>S.V. Fermi · 2026–2027</p>
        </div>
        <span className="fermi-pdf-header-icon" aria-hidden="true">
          <FileText size={23} />
        </span>
      </header>

      <section className="fermi-pdf-toolbar" aria-label="PDF bediening">
        <button
          type="button"
          className="fermi-pdf-toc-button"
          onClick={() => setTocOpen(true)}
          disabled={loading}
          aria-label="Open inhoudsopgave"
        >
          <span className="fermi-pdf-toc-button-icon"><ListTree size={18} /></span>
          <span className="fermi-pdf-toc-button-copy">
            <strong>Inhoudsopgave</strong>
            <small>Spring naar hoofdstuk</small>
          </span>
          <ChevronRight size={18} className="fermi-pdf-toc-button-chevron" />
        </button>

        <div className="fermi-pdf-toolbar-group">
          <button type="button" onClick={previousPage} disabled={pageNumber <= 1 || loading} aria-label="Vorige pagina">
            <ChevronLeft size={19} />
          </button>
          <span className="fermi-pdf-page-counter">
            <strong>{pageNumber}</strong>
            <small>/ {pageCount || "—"}</small>
          </span>
          <button type="button" onClick={nextPage} disabled={pageNumber >= pageCount || loading} aria-label="Volgende pagina">
            <ChevronRight size={19} />
          </button>
        </div>

        <div className="fermi-pdf-toolbar-group">
          <button type="button" onClick={zoomOut} disabled={zoom <= 0.7 || loading} aria-label="Uitzoomen">
            <Minus size={18} />
          </button>
          <span className="fermi-pdf-zoom">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={zoomIn} disabled={zoom >= 2.2 || loading} aria-label="Inzoomen">
            <Plus size={18} />
          </button>
        </div>
      </section>

      <section
        className="fermi-pdf-stage"
        ref={stageRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {loading && (
          <div className="fermi-pdf-state" role="status">
            <span className="fermi-pdf-loader" />
            <strong>Beleidsplan laden…</strong>
            <small>De preview wordt klaargezet.</small>
          </div>
        )}

        {error && (
          <div className="fermi-pdf-state error">
            <FileText size={34} />
            <strong>Preview niet beschikbaar</strong>
            <small>{error}</small>
            <a href={resolvePdfUrl()} target="_blank" rel="noopener noreferrer">Open de PDF rechtstreeks</a>
          </div>
        )}

        <div
          ref={canvasWrapRef}
          className={`fermi-pdf-canvas-wrap${loading || error ? " hidden" : ""}`}
        >
          <canvas ref={canvasRef} aria-label={`Pagina ${pageNumber} van het beleidsplan`} />
          {rendering && <span className="fermi-pdf-rendering">Pagina laden…</span>}
        </div>
      </section>

      {tocOpen && (
        <div className="fermi-pdf-toc-backdrop" onClick={() => setTocOpen(false)}>
          <section
            className="fermi-pdf-toc-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Inhoudsopgave"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="fermi-pdf-toc-grabber" aria-hidden="true" />
            <header>
              <div>
                <small>BELEIDSPLAN</small>
                <h2>Inhoudsopgave</h2>
              </div>
              <button type="button" onClick={() => setTocOpen(false)} aria-label="Sluit inhoudsopgave">
                <X size={20} />
              </button>
            </header>

            {toc.length > 0 ? (
              <div className="fermi-pdf-toc-list">
                {toc.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.title}-${index}`}
                    className={`depth-${item.depth}${pageNumber === item.page ? " active" : ""}`}
                    style={{ paddingLeft: `${14 + Math.min(item.depth, 3) * 18}px` }}
                    onClick={() => goToTocPage(item.page)}
                    disabled={!item.page}
                  >
                    <span>{item.title}</span>
                    <small>{item.page ? `p. ${item.page}` : "—"}</small>
                  </button>
                ))}
              </div>
            ) : (
              <div className="fermi-pdf-toc-empty">
                <ListTree size={30} />
                <strong>Inhoudsopgave niet beschikbaar</strong>
                <small>De navigatie kon niet worden geladen.</small>
              </div>
            )}
          </section>
        </div>
      )}

      <footer className="fermi-pdf-actions">
        <a className="fermi-pdf-action secondary" href={resolvePdfUrl()} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={18} />
          Open origineel
        </a>
        <a className="fermi-pdf-action primary" href={resolvePdfUrl()} download="beleidsplan-fermi-2026-2027.pdf">
          <Download size={18} />
          Download PDF
        </a>
      </footer>
    </main>
  );
}
