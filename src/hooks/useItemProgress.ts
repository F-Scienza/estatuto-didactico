import { useCallback, useEffect, useState } from "react";

interface ItemProgress {
  read: string[];
  doubts: string[];
}

const STORAGE_KEY = "estatuto-didactico:item-progress";
const EMPTY_PROGRESS: ItemProgress = { read: [], doubts: [] };

function loadProgress(): ItemProgress {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_PROGRESS;

    const parsed = JSON.parse(stored) as Partial<ItemProgress>;
    return {
      read: Array.isArray(parsed.read) ? parsed.read : [],
      doubts: Array.isArray(parsed.doubts) ? parsed.doubts : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function useItemProgress() {
  const [progress, setProgress] = useState<ItemProgress>(loadProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress remains available for the current session if storage is blocked.
    }
  }, [progress]);

  const markAsRead = useCallback((itemId: string) => {
    setProgress((current) =>
      current.read.includes(itemId)
        ? current
        : { ...current, read: [...current.read, itemId] },
    );
  }, []);

  const toggleDoubt = useCallback((itemId: string) => {
    setProgress((current) => ({
      ...current,
      doubts: current.doubts.includes(itemId)
        ? current.doubts.filter((id) => id !== itemId)
        : [...current.doubts, itemId],
    }));
  }, []);

  return {
    readItems: new Set(progress.read),
    doubtItems: new Set(progress.doubts),
    markAsRead,
    toggleDoubt,
  };
}
