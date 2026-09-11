import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "estatuto-theme";

/**
 * Returns the user's explicit choice from localStorage, or null if none.
 */
function readStoredChoice(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* SSR or private browsing */
  }
  return null;
}

/**
 * Checks the system preference for dark mode.
 */
function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? false
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Resolves the initial theme:
 * - If user has an explicit localStorage choice, use it
 * - Otherwise respect system preference (dark if system says dark, light otherwise)
 * - Light is the default when no system preference exists
 */
function resolveInitialTheme(): Theme {
  const stored = readStoredChoice();
  if (stored) return stored;
  return systemPrefersDark() ? "dark" : "light";
}

/**
 * Theme hook: manages light/dark state, persists to localStorage,
 * applies data-theme attribute to <html>, and listens for system changes
 * only until the user makes an explicit choice.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme);
  const [hasExplicitChoice, setHasExplicitChoice] = useState(
    () => readStoredChoice() !== null,
  );

  /* Apply theme attribute on <html> */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  }, [theme]);

  /* Listen for system preference changes — but only if user hasn't chosen yet */
  useEffect(() => {
    if (hasExplicitChoice) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [hasExplicitChoice]);

  /** Toggle between light and dark, persisting the choice. */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
    setHasExplicitChoice(true);
  }, []);

  return { theme, toggleTheme } as const;
}
