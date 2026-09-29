import { useEffect, type RefObject } from "react";

/** Progressive enhancement: content is never hidden while waiting for JavaScript. */
export function useWorkspaceEffects(
  root: RefObject<HTMLDivElement | null>,
  path: string,
  paused: boolean,
) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const available = document.documentElement.scrollHeight - window.innerHeight;
      element.style.setProperty(
        "--ds-reading-progress",
        String(available > 0 ? Math.min(1, window.scrollY / available) : 0),
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    update();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!paused && !motion.matches) entry.target.classList.add("ds-enter");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.06 },
    );
    const targets = element.querySelectorAll(
      ".ds-workspace-content > *, .ds-workspace-content > * > section, .ds-workspace-content > article > section",
    );
    targets.forEach((target) => {
      target.classList.remove("ds-enter");
      if (target.getBoundingClientRect().top > window.innerHeight - 30) observer.observe(target);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      observer.disconnect();
      targets.forEach((target) => target.classList.remove("ds-enter"));
    };
  }, [root, path, paused]);
}
