import { useCallback, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useNavigation } from "./hooks/useNavigation";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useTheme } from "./hooks/useTheme";
import { CONTENT } from "./data/topics";
import { Explorer } from "./components/Explorer";
import { TopicDetailView } from "./components/TopicDetailView";
import { ChangeDetailView } from "./components/ChangeDetailView";
import { ThemeToggle } from "./components/ThemeToggle";
import "./App.css";

export default function App() {
  const { view, navigate, goBack, direction } = useNavigation();
  const reduced = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  const mainRef = useRef<HTMLElement>(null);
  const isAnimatingBack = useRef(false);

  /** Back with a brief "recession" animation before navigating. */
  const handleBack = useCallback(() => {
    if (reduced || !mainRef.current) {
      goBack();
      return;
    }
    if (isAnimatingBack.current) {
      gsap.killTweensOf(mainRef.current);
      gsap.set(mainRef.current, { clearProps: "all" });
      isAnimatingBack.current = false;
      goBack();
      return;
    }
    isAnimatingBack.current = true;
    gsap.to(mainRef.current, {
      scale: 0.97,
      opacity: 0.85,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        isAnimatingBack.current = false;
        gsap.set(mainRef.current!, { clearProps: "all" });
        goBack();
      },
    });
  }, [reduced, goBack]);

  const renderView = () => {
    switch (view.level) {
      case "explorer":
        return (
          <Explorer
            key="explorer"
            topics={CONTENT.topics}
            direction={direction}
            onSelectTopic={(id) => navigate({ level: "topic", topicId: id })}
          />
        );

      case "topic": {
        const topic = CONTENT.details[view.topicId];
        if (!topic) return null;
        return (
          <TopicDetailView
            key={`topic-${view.topicId}`}
            topic={topic}
            direction={direction}
            onBack={handleBack}
            onSelectChange={(changeId) =>
              navigate({
                level: "change",
                topicId: view.topicId,
                changeId,
              })
            }
          />
        );
      }

      case "change": {
        const topic = CONTENT.details[view.topicId];
        if (!topic) return null;
        const change = topic.changes.find((c) => c.id === view.changeId);
        if (!change) return null;
        return (
          <ChangeDetailView
            key={`change-${view.changeId}`}
            change={change}
            topicTitle={topic.title}
            integration={CONTENT.integration}
            direction={direction}
            onBack={handleBack}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__brand">cab</span>
        <span className="app__header-title">Guía de la reforma</span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>
      <main className="app__main" ref={mainRef}>
        {renderView()}
      </main>
      <footer className="app__footer">
        Iniciativa independiente. No es un sitio oficial del Club Atlético Belgrano
      </footer>
    </div>
  );
}
