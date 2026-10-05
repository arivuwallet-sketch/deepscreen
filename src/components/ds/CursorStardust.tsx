import { useEffect, useRef } from "react";

import { useMotionPreference } from "@/hooks/useMotionPreference";

type StardustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  spin: number;
  twinkle: number;
  kind: "star" | "dust";
};

const MAX_PARTICLES = 84;

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
    const r = i % 2 === 0 ? radius : radius * 0.2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function CursorStardust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { paused } = useMotionPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || paused) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    let lastFrame = performance.now();
    const particles: StardustParticle[] = [];
    const pointer = {
      x: width / 2,
      y: height / 2,
      px: width / 2,
      py: height / 2,
      lastMove: performance.now(),
      active: false,
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const addParticle = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      forceStar = false,
    ) => {
      if (particles.length >= MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES + 1);
      const maxLife = 520 + Math.random() * 620;
      particles.push({
        x: x + (Math.random() - 0.5) * 9,
        y: y + (Math.random() - 0.5) * 9,
        vx: vx + (Math.random() - 0.5) * 0.5,
        vy: vy + (Math.random() - 0.5) * 0.5 - 0.08,
        life: maxLife,
        maxLife,
        size: forceStar ? 2.5 + Math.random() * 2.2 : 0.8 + Math.random() * 2.6,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.055,
        twinkle: Math.random() * Math.PI * 2,
        kind: forceStar || Math.random() > 0.72 ? "star" : "dust",
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const now = performance.now();
      if (!pointer.active) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.px = event.clientX;
        pointer.py = event.clientY;
        pointer.lastMove = now;
        pointer.active = true;
        return;
      }
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const distance = Math.hypot(dx, dy);
      const elapsed = Math.max(8, now - pointer.lastMove);
      const speed = Math.min(2.8, distance / elapsed);

      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.lastMove = now;

      if (distance < 2) return;
      const count = Math.min(7, 2 + Math.floor(distance / 18));
      const trailX = distance ? -dx / distance : 0;
      const trailY = distance ? -dy / distance : 0;
      for (let i = 0; i < count; i += 1) {
        const t = i / Math.max(1, count - 1);
        const x = pointer.px + dx * t;
        const y = pointer.py + dy * t;
        const drift = 0.18 + speed * 0.42;
        addParticle(x, y, trailX * drift, trailY * drift);
      }
    };

    const deactivatePointer = () => {
      pointer.active = false;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      for (let i = 0; i < 15; i += 1) {
        const angle = (Math.PI * 2 * i) / 15 + Math.random() * 0.22;
        const velocity = 0.55 + Math.random() * 1.25;
        addParticle(
          event.clientX,
          event.clientY,
          Math.cos(angle) * velocity,
          Math.sin(angle) * velocity,
          i % 3 === 0,
        );
      }
    };

    const animate = (now: number) => {
      const delta = Math.min(32, now - lastFrame);
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]!;
        p.life -= delta;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const age = 1 - p.life / p.maxLife;
        const fade = Math.sin(Math.PI * Math.min(1, p.life / p.maxLife));
        p.x += p.vx * delta * 0.055;
        p.y += p.vy * delta * 0.055;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 - 0.0018 * delta;
        p.rotation += p.spin;
        p.twinkle += delta * 0.015;

        const shimmer = 0.68 + Math.sin(p.twinkle) * 0.28;
        const alpha = Math.max(0, fade * shimmer * (1 - age * 0.2));
        const lime = i % 4 !== 0;

        ctx.fillStyle = lime
          ? `rgba(200, 250, 134, ${alpha * 0.82})`
          : `rgba(221, 239, 211, ${alpha * 0.72})`;
        ctx.shadowColor = lime
          ? `rgba(200, 250, 134, ${alpha * 0.75})`
          : `rgba(221, 239, 211, ${alpha * 0.55})`;
        ctx.shadowBlur = p.kind === "star" ? 10 : 5;

        if (p.kind === "star") {
          drawStar(ctx, p.x, p.y, p.size * (0.9 + shimmer * 0.2), p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.7 + shimmer * 0.12), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("blur", deactivatePointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", deactivatePointer, { passive: true });
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("blur", deactivatePointer);
      document.documentElement.removeEventListener("pointerleave", deactivatePointer);
      ctx.clearRect(0, 0, width, height);
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="ds-cursor-stardust" aria-hidden="true" />;
}
