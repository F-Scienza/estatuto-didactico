import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { TopicDetail, ChangeItem } from "../types";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { NavDirection } from "../hooks/useNavigation";

interface TopicDetailProps {
  topic: TopicDetail;
  direction: NavDirection;
  onBack: () => void;
  onSelectChange: (changeId: string) => void;
  readItems: Set<string>;
  doubtItems: Set<string>;
}

function ChevronRight() {
  return (
    <svg
      className="topic__item-arrow"
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

export function TopicDetailView({
  topic,
  direction,
  onBack,
  onSelectChange,
  readItems,
  doubtItems,
}: TopicDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /* ── Entrance timeline ───────────────────────────────────── */
  const { contextSafe } = useGSAP(
    () => {
      if (reduced || direction === "back") return;

      const heading = containerRef.current?.querySelector(".topic__title");
      const items = containerRef.current?.querySelectorAll(".topic__item");
      const back = containerRef.current?.querySelector(".topic__back");

      const tl = gsap.timeline();
      if (back) {
        tl.from(back, { opacity: 0, x: -8, duration: 0.2 }, "0");
      }
      if (heading) {
        tl.from(heading, { opacity: 0, y: 12, duration: 0.25 }, "-=0.15");
      }
      if (items?.length) {
        tl.from(
          items,
          { opacity: 0, y: 12, duration: 0.2, stagger: 0.035 },
          "-=0.1",
        );
      }
    },
    { scope: containerRef },
  );

  /* ── Press feedback on change items ────────────────────────── */
  const handleItemPointerDown = contextSafe(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced) return;
      gsap.to(e.currentTarget, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.out",
      });
    },
  );

  const handleItemPointerUp = contextSafe(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced) return;
      gsap.to(e.currentTarget, {
        scale: 1,
        duration: 0.15,
        ease: "back.out(2)",
      });
    },
  );

  const handleItemKeyDown = contextSafe(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (reduced) return;
      if (e.key === "Enter" || e.key === " ") {
        gsap.to(e.currentTarget, { scale: 0.98, duration: 0.08 });
      }
    },
  );

  const handleItemKeyUp = contextSafe(
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
      <section
        className="topic"
        aria-label={topic.title}
        ref={containerRef}
      >
        <button
          className="topic__back"
          onClick={onBack}
          type="button"
          aria-label="Volver a los temas"
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
          className="topic__title"
          tabIndex={-1}
        >
          {topic.title}
        </h2>

        <ul className="topic__list" role="list">
          {topic.changes.map((change: ChangeItem) => (
            <li key={change.id}>
              <button
                className="topic__item"
                onClick={() => onSelectChange(change.id)}
                type="button"
                onPointerDown={handleItemPointerDown}
                onPointerUp={handleItemPointerUp}
                onPointerLeave={handleItemPointerUp}
                onKeyDown={handleItemKeyDown}
                onKeyUp={handleItemKeyUp}
              >
                <span className="topic__item-label">{change.subtitle}</span>
                {doubtItems.has(change.id) ? (
                  <span
                    className="topic__item-status topic__item-status--doubt"
                    aria-label="Marcado con dudas"
                    title="Tengo dudas"
                  >
                    ?
                  </span>
                ) : readItems.has(change.id) ? (
                  <span
                    className="topic__item-status topic__item-status--read"
                    aria-label="Leído"
                    title="Leído"
                  >
                    ✓
                  </span>
                ) : (
                  <ChevronRight />
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
