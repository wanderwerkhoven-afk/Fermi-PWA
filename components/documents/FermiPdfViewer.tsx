"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from "pdfjs-dist";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Minus,
  Plus,
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

export default function FermiPdfViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const renderIdRef = useRef(0);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");

  const renderPage = useCallback(async (nextPage = pageNumber, nextZoom = zoom) => {
    const pdf = documentRef.current;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!pdf || !canvas || !stage) return;

    const renderId = ++renderIdRef.current;
    setRendering(true);

    try {
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
      await page.render({ canvasContext: context, viewport: renderViewport }).promise;
    } catch (cause) {
      console.error(cause);
      setError("Deze pagina kon niet worden weergegeven.");
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

      <section className="fermi-pdf-stage" ref={stageRef}>
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

        <div className={`fermi-pdf-canvas-wrap${loading || error ? " hidden" : ""}`}>
          <canvas ref={canvasRef} aria-label={`Pagina ${pageNumber} van het beleidsplan`} />
          {rendering && <span className="fermi-pdf-rendering">Pagina laden…</span>}
        </div>
      </section>

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
