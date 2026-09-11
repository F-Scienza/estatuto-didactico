import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { ChangeItem, ReformaIntegracion, ReformaFuente } from "../types";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { NavDirection } from "../hooks/useNavigation";
import { shareComparison } from "../utils/shareComparison";

interface ChangeDetailViewProps {
  change: ChangeItem;
  topicTitle: string;
  integration: ReformaIntegracion;
  direction: NavDirection;
  onBack: () => void;
  hasDoubt: boolean;
  onToggleDoubt: () => void;
}

function formatSource(f: ReformaFuente): string {
  const parts: string[] = [];
  const docName = f.documentoId === "proyecto" ? "Proyecto" : "Anexo comparativo";
  if (f.articulos && f.articulos.length > 0) {
    parts.push(`Arts. ${f.articulos.join(", ")}`);
  }
  if (f.paginas && f.paginas.length > 0) {
    parts.push(`${docName}, pág. ${f.paginas.join(", ")}`);
  }
  if (!parts.length) {
    parts.push(docName);
  }
  return parts.join(" — ");
}

function ReviewBadge({ estado }: { estado: string }) {
  const labels: Record<string, string> = {
    cotejado_con_documentos_aportados: "Cotejado con documentos aportados",
    requiere_aclaracion: "Requiere aclaración",
  };
  return (
    <span className={`detail__review-badge detail__review-badge--${estado}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

export function ChangeDetailView({
  change,
  topicTitle,
  integration,
  direction,
  onBack,
  hasDoubt,
  onToggleDoubt,
}: ChangeDetailViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const [shareStatus, setShareStatus] = useState<string>("");

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /* ── Entrance timeline ───────────────────────────────────── */
  useGSAP(
    () => {
      if (reduced || direction === "back") return;

      const back = containerRef.current?.querySelector(".detail__back");
      const heading = containerRef.current?.querySelector(".detail__title");
      const cards = containerRef.current?.querySelectorAll(".detail__comparison-card");
      const sections = containerRef.current?.querySelectorAll(".detail__section");

      const tl = gsap.timeline();
      if (back) {
        tl.from(back, { opacity: 0, x: -8, duration: 0.2 }, "0");
      }
      if (heading) {
        tl.from(heading, { opacity: 0, y: 12, duration: 0.25 }, "-=0.15");
      }
      if (cards?.length) {
        tl.from(
          cards,
          { opacity: 0, y: 14, duration: 0.22, stagger: 0.06 },
          "-=0.1",
        );
      }
      if (sections?.length) {
        tl.from(
          sections,
          { opacity: 0, y: 10, duration: 0.2, stagger: 0.04 },
          "-=0.08",
        );
      }
    },
    { scope: containerRef },
  );

  const hasDetails = change.details.length > 0;
  const hasReviewNotes = change.reviewNotes.length > 0;
  const hasSources = change.sources.length > 0;

  const handleShare = async () => {
    setShareStatus("");
    try {
      const result = await shareComparison({
        title: change.subtitle,
        currentLabel: integration.etiquetaVigente,
        currentText: change.currentStatute,
        proposalLabel: integration.etiquetaPropuesta,
        proposalText: change.proposal,
      });
      setShareStatus(result === "shared" ? "Contenido compartido" : "Imagen descargada");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("No se pudo compartir. Intentá nuevamente.");
    }
  };

  return (
    <div className="app__shell">
      <section className="detail" aria-label={change.subtitle} ref={containerRef}>
        <button
          className="detail__back"
          onClick={onBack}
          type="button"
          aria-label={`Volver a ${topicTitle}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver a los temas
        </button>

        <h2
          ref={headingRef}
          className="detail__title"
          tabIndex={-1}
        >
          {change.subtitle}
        </h2>

        <div className="detail__actions">
          <button
            className={`detail__doubt-toggle${hasDoubt ? " detail__doubt-toggle--active" : ""}`}
            type="button"
            aria-pressed={hasDoubt}
            onClick={onToggleDoubt}
          >
            <span className="detail__doubt-icon" aria-hidden="true">?</span>
            {hasDoubt ? "Duda registrada" : "Tengo dudas"}
          </button>
          <button className="detail__share" type="button" onClick={handleShare}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Compartir
          </button>
          <span className="detail__share-status" role="status" aria-live="polite">
            {shareStatus}
          </span>
        </div>

        {/* Comparison cards: stack mobile, 2-col desktop */}
        <div className="detail__comparison">
          <div className="detail__comparison-card detail__comparison-card--vigente" role="region" aria-label={integration.etiquetaVigente}>
            <h4 className="detail__label detail__label--vigente">{integration.etiquetaVigente}</h4>
            <p className="detail__value">{change.currentStatute}</p>
          </div>
          <div className="detail__comparison-card detail__comparison-card--propuesta" role="region" aria-label={integration.etiquetaPropuesta}>
            <h4 className="detail__label detail__label--propuesta">{integration.etiquetaPropuesta}</h4>
            <p className="detail__value">{change.proposal}</p>
          </div>
        </div>

        {/* Qué cambia */}
        <div className="detail__section">
          <h4 className="detail__section-label">Qué cambia</h4>
          <p className="detail__section-value">{change.whatChanges}</p>
        </div>

        {/* Qué busca el club */}
        <div className="detail__section">
          <h4 className="detail__section-label">{integration.etiquetaObjetivo}</h4>
          <p className="detail__section-value">{change.clubGoal}</p>
        </div>

        {/* Detalles */}
        {hasDetails && (
          <div className="detail__section">
            <h4 className="detail__section-label">Detalles</h4>
            <ul className="detail__details-list">
              {change.details.map((d, i) => (
                <li key={i} className="detail__details-item">{d}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notas de revisión */}
        {hasReviewNotes && (
          <div className="detail__section detail__review-section">
            <h4 className="detail__section-label">Notas de revisión</h4>
            <div className="detail__review-box">
              {change.reviewNotes.map((note, i) => (
                <p key={i} className="detail__review-note">{note}</p>
              ))}
            </div>
          </div>
        )}

        {/* Fuentes */}
        {hasSources && (
          <div className="detail__sources">
            <h4 className="detail__sources-label">Fuentes consultadas</h4>
            <ul className="detail__sources-list">
              {change.sources.map((f, i) => (
                <li key={i} className="detail__sources-item">
                  {formatSource(f)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Estado de revisión */}
        {change.requiresHumanReview && (
          <div className="detail__revision-footer">
            <ReviewBadge estado={change.estadoRevision} />
          </div>
        )}
      </section>
    </div>
  );
}
