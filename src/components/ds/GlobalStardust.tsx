import { useEffect, useRef } from "react";

import { useMotionPreference } from "@/hooks/useMotionPreference";

type StardustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  twinkle: number;
  twinkleSpeed: number;
  rotation: number;
  spin: number;
  depth: number;
  kind: "dust" | "star";
};

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI / 4) * i;
    const r = i % 2 === 0 ? radius : radius * 0.24;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function GlobalStardust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { paused } = useMotionPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || paused) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let last = performance.now();
    let particles: StardustParticle[] = [];

    const buildParticles = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const area = Math.max(1, width * height);
      const target = Math.max(
        coarse ? 30 : 55,
        Math.min(coarse ? 58 : 110, Math.round(area / (coarse ? 25000 : 17000))),
      );

      particles = Array.from({ length: target }, (_, index) => {
        const depth = 0.35 + Math.random() * 0.65;
        const isStar = index % 9 === 0;
        const angle = Math.random() * Math.PI * 2;
        const speed = (isStar ? 0.035 : 0.022) + Math.random() * 0.045;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed * depth,
          vy: (-0.025 - Math.random() * 0.055) * depth,
          size: isStar ? 1.6 + Math.random() * 1.9 : 0.45 + Math.random() * 1.15,
          alpha: isStar ? 0.28 + Math.random() * 0.28 : 0.12 + Math.random() * 0.24,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.0018 + Math.random() * 0.0036,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.0016,
          depth,
          kind: isStar ? "star" : "dust",
        };
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const animate = (now: number) => {
      const delta = Math.min(34, now - last);
      last = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]!;
        p.twinkle += delta * p.twinkleSpeed;
        p.rotation += p.spin * delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        // Slow horizontal breathing makes the field feel organic without following the cursor.
        p.x += Math.sin(p.twinkle * 0.72 + i) * 0.007 * delta * p.depth;

        const margin = 12;
        if (p.y < -margin) {
          p.y = height + margin;
          p.x = Math.random() * width;
        } else if (p.y > height + margin) {
          p.y = -margin;
        }
        if (p.x < -margin) p.x = width + margin;
        else if (p.x > width + margin) p.x = -margin;

        const shimmer = 0.72 + Math.sin(p.twinkle) * 0.28;
        const alpha = p.alpha * shimmer;
        const primary = i % 5 !== 0;

        ctx.fillStyle = primary
          ? `rgba(200, 250, 134, ${alpha})`
          : `rgba(226, 240, 220, ${alpha * 0.9})`;
        ctx.shadowColor = primary
          ? `rgba(200, 250, 134, ${alpha * 0.42})`
          : `rgba(226, 240, 220, ${alpha * 0.3})`;
        ctx.shadowBlur = p.kind === "star" ? 8 * p.depth : 3 * p.depth;

        if (p.kind === "star") {
          drawStar(ctx, p.x, p.y, p.size * (0.9 + shimmer * 0.14), p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.88 + shimmer * 0.08), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="ds-global-stardust" aria-hidden="true" />;
}
