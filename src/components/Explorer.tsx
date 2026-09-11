import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { TopicSummary } from "../types";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { NavDirection } from "../hooks/useNavigation";

interface ExplorerProps {
  topics: TopicSummary[];
  direction: NavDirection;
  topicProgress: Record<string, TopicProgress>;
  onSelectTopic: (topicId: string) => void;
}

interface TopicProgress {
  total: number;
  read: number;
  doubts: number;
}

function ChevronRight() {
  return (
    <svg
      className="card__arrow"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.5 4.5L13 10L7.5 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Explorer({
  topics,
  direction,
  topicProgress,
  onSelectTopic,
}: ExplorerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /* ── Entrance timeline: welcome → cards stagger ────────────── */
  const { contextSafe } = useGSAP(
    () => {
      if (reduced || direction === "back") return;

      const title = containerRef.current?.querySelector(".explorer__title");
      const lead = containerRef.current?.querySelector(".explorer__lead");
      const prompt = containerRef.current?.querySelector(".explorer__prompt");
      const cards = containerRef.current?.querySelectorAll(".card");

      const tl = gsap.timeline();

      if (title) {
        tl.from(title, { opacity: 0, y: 14, duration: 0.3, ease: "power2.out" });
      }
      if (lead) {
        tl.from(lead, { opacity: 0, y: 10, duration: 0.25 }, "-=0.15");
      }
      if (prompt) {
        tl.from(prompt, { opacity: 0, y: 8, duration: 0.2 }, "-=0.1");
      }
      if (cards?.length) {
        tl.from(
          cards,
          { opacity: 0, y: 14, duration: 0.25, stagger: 0.04 },
          "-=0.08",
        );
      }
    },
    { scope: containerRef },
  );

  /* ── Press / selection feedback (cleanup-safe via contextSafe) ── */
  const handlePointerDown = contextSafe(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced) return;
      gsap.to(e.currentTarget, {
        scale: 0.97,
        duration: 0.1,
        ease: "power2.out",
      });
    },
  );

  const handlePointerUp = contextSafe(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced) return;
      gsap.to(e.currentTarget, {
        scale: 1,
        duration: 0.15,
        ease: "back.out(2)",
      });
    },
  );

  const handleKeyDown = contextSafe(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (reduced) return;
      if (e.key === "Enter" || e.key === " ") {
        gsap.to(e.currentTarget, { scale: 0.97, duration: 0.08 });
      }
    },
  );

  const handleKeyUp = contextSafe(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (reduced) return;
      if (e.key === "Enter" || e.key === " ") {
        gsap.to(e.currentTarget, {
          scale: 1,
          duration: 0.15,
          ease: "back.out(2)",
        });
      }
    },
  );

  return (
    <div className="app__shell">
      <section className="explorer" aria-label="Temas del estatuto" ref={containerRef}>
        <div className="explorer__welcome">
          <h1
            ref={headingRef}
            className="explorer__title"
            tabIndex={-1}
          >
            ¿Qué cambiaría en Belgrano?
          </h1>
          <p className="explorer__lead">
            Explorá la propuesta de reforma, tema por tema.
          </p>
        </div>

        <p className="explorer__prompt">¿Qué te interesa conocer?</p>

        <div className="explorer__grid" role="list">
          {topics.map((topic) => {
            const progress = topicProgress[topic.id] ?? { total: 0, read: 0, doubts: 0 };
            const isComplete = progress.total > 0 && progress.read === progress.total;

            return (
              <button
                key={topic.id}
                className="card"
                role="listitem"
                onClick={() => onSelectTopic(topic.id)}
                type="button"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
              >
                <span className="card__number" aria-hidden="true">
                  {topic.icon}
                </span>
                <div className="card__body">
                  <h3 className="card__title">{topic.title}</h3>
                  <p className="card__phrase">{topic.phrase}</p>
                  <div
                    className="card__progress"
                    aria-label={`${progress.read} de ${progress.total} puntos vistos${progress.doubts > 0 ? `, ${progress.doubts} con dudas` : ""}`}
                  >
                    <span className={`card__progress-main${isComplete ? " card__progress-main--complete" : ""}`}>
                      {isComplete ? "✓ Todos vistos" : `${progress.read} de ${progress.total} vistos`}
                    </span>
                    {progress.doubts > 0 && (
                      <span className="card__progress-doubts">
                        ({progress.doubts} {progress.doubts === 1 ? "duda" : "dudas"})
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight />
              </button>
            );
          })}
        </div>

        <span className="explorer__tag">
          Prototipo visual · Contenido pendiente de revisión
        </span>
      </section>
    </div>
  );
}
