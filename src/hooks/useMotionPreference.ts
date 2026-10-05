import { useEffect, useState } from "react";

const KEY = "deepscreen-motion-paused";
const EVENT = "deepscreen-motion-preference";

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
    const syncLocal = (event: Event) => {
      setPaused(Boolean((event as CustomEvent<boolean>).detail));
    };
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, syncLocal);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, syncLocal);
    };
  }, []);
  const toggle = () =>
    setPaused((value) => {
      try {
        window.localStorage.setItem(KEY, String(!value));
        window.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: !value }));
      } catch {
        /* Private browsing remains usable. */
      }
      return !value;
    });
  return { paused, toggle };
}
