import { useCallback, useEffect, useRef, useState } from "react";

export type NavView =
  | { level: "explorer" }
  | { level: "topic"; topicId: string }
  | { level: "change"; topicId: string; changeId: string };

export type NavDirection = "forward" | "back";

function encodeState(view: NavView): string {
  if (view.level === "explorer") return "estatuto::explorer";
  if (view.level === "topic") return `estatuto::topic::${view.topicId}`;
  return `estatuto::change::${view.topicId}::${view.changeId}`;
}

function decodeState(key: string): NavView {
  if (key === "estatuto::explorer") return { level: "explorer" };
  const parts = key.split("::");
  if (parts[1] === "topic" && parts[2])
    return { level: "topic", topicId: parts[2] };
  if (parts[1] === "change" && parts[2] && parts[3])
    return {
      level: "change",
      topicId: parts[2],
      changeId: parts[3],
    };
  return { level: "explorer" };
}

function readState(): NavView {
  return decodeState(window.history.state ?? "estatuto::explorer");
}

/**
 * Navigation backed by browser history.
 * Push a new entry for forward navigation; replace for back restores.
 * Exposes `direction` so child components can skip entrance animations on back.
 */
export function useNavigation() {
  const [view, setView] = useState<NavView>(readState);
  const [direction, setDirection] = useState<NavDirection>("forward");
  const pendingBack = useRef(false);

  /* Sync on back/forward. */
  useEffect(() => {
    function onPop() {
      setView(readState());
      setDirection("back");
      pendingBack.current = false;
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /** Navigate forward (pushes history). */
  const navigate = useCallback((next: NavView) => {
    pendingBack.current = false;
    const key = encodeState(next);
    const title = document.title;
    window.history.pushState(key, title, `#${key}`);
    setView(next);
    setDirection("forward");
  }, []);

  /** Navigate back in stack (uses browser back). */
  const goBack = useCallback(() => {
    pendingBack.current = true;
    setDirection("back");
    window.history.back();
  }, []);

  return { view, navigate, goBack, direction } as const;
}
