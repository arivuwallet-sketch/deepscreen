import { useEffect, useState } from "react";

const KEY = "deepscreen-motion-paused";

/** Hydration-safe, shared preference for the landing page and research workspace. */
export function useMotionPreference() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    try {
      setPaused(window.localStorage.getItem(KEY) === "true");
    } catch {
      /* Storage is optional. */
    }
    const sync = (event: StorageEvent) => {
      if (event.key === KEY) setPaused(event.newValue === "true");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const toggle = () =>
    setPaused((value) => {
      try {
        window.localStorage.setItem(KEY, String(!value));
      } catch {
        /* Private browsing remains usable. */
      }
      return !value;
    });
  return { paused, toggle };
}
