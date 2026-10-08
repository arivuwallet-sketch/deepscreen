import { useEffect, useRef, useState } from "react";
import "./scene.css";

/** A decorative, locally rendered scene. The complete page also works without WebGL. */
export function MarketScene({
  paused,
  market,
  variant = "journey",
}: {
  paused: boolean;
  market: number;
  variant?: "journey" | "compact";
}) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef({ paused, market });
  const [ready, setReady] = useState(false);
  controls.current = { paused, market };

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const element = host.current;
    if (!element) return;
    // Keep shader compilation and decorative downloads out of initial hydration.
    // The existing CSS scene remains visible while the browser paints the page.
    const start = () => { void Promise.all([import("three"), import("three/addons/environments/RoomEnvironment.js")])
      .then(([T, { RoomEnvironment }]) => {
        if (disposed) return;
        let renderer: InstanceType<typeof T.WebGLRenderer>;
        try {
          renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        const compact = variant === "compact" || window.innerWidth < 760;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.25 : 1.75));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        element.appendChild(renderer.domElement);
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(34, 1, 0.1, 50);
        camera.position.set(0, 0, 11);
        const pmrem = new T.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const environment = pmrem.fromScene(room, 0.04);
        scene.environment = environment.texture;
        room.dispose();
        pmrem.dispose();
        scene.add(new T.AmbientLight(0xc5ffe7, 0.5));
        const key = new T.DirectionalLight(0xffffff, 3);
        key.position.set(-4, 6, 5);
        scene.add(key);
        const rim = new T.PointLight(0xb9ff65, 40, 20);
        rim.position.set(3, -1, 3);
        scene.add(rim);
        const blue = new T.PointLight(0x72a9e7, 25, 20);
        blue.position.set(-4, 2, -2);
        scene.add(blue);

        const engine = new T.Group();
        scene.add(engine);
        const silver = new T.MeshStandardMaterial({
          color: 0xc2d4ca,
          metalness: 0.96,
          roughness: 0.22,
        });
        const blackMetal = new T.MeshStandardMaterial({
          color: 0x152b25,
          metalness: 0.8,
          roughness: 0.3,
        });
        const glass = new T.MeshPhysicalMaterial({
          color: 0x36845b,
          metalness: 0.12,
          roughness: 0.12,
          transmission: compact ? 0.45 : 0.85,
          thickness: 1.5,
          ior: 1.5,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          attenuationColor: new T.Color(0x087957),
          attenuationDistance: 2,
        });
        const luminous = new T.MeshStandardMaterial({
          color: 0xc6ff87,
          emissive: 0x7ad244,
          emissiveIntensity: 0.5,
          roughness: 0.2,
          metalness: 0.3,
        });
        const crystal = new T.Mesh(new T.IcosahedronGeometry(1.22, 1), glass);
        engine.add(crystal);
        const core = new T.Mesh(new T.IcosahedronGeometry(0.65, 0), luminous);
        engine.add(core);
        const edges = new T.LineSegments(
          new T.EdgesGeometry(crystal.geometry),
          new T.LineBasicMaterial({ color: 0xd8ffe1, transparent: true, opacity: 0.18 }),
        );
        crystal.add(edges);
        const rings: InstanceType<typeof T.Group>[] = [];
        for (let i = 0; i < 3; i++) {
          const group = new T.Group();
          const radius = 1.7 + i * 0.36;
          const outer = new T.Mesh(
            new T.TorusGeometry(radius, 0.065 - i * 0.012, 12, compact ? 90 : 160),
            i === 1 ? blackMetal : silver,
          );
          group.add(outer);
          const trace = new T.Mesh(
            new T.TorusGeometry(radius - 0.085, 0.009, 6, 100, Math.PI * 1.3),
            luminous,
          );
          group.add(trace);
          const node = new T.Mesh(new T.SphereGeometry(0.095, 16, 12), luminous);
          node.position.x = radius;
          group.add(node);
          group.rotation.set(0.9 + i * 0.6, i * 0.5, i * 0.6 - 0.5);
          engine.add(group);
          rings.push(group);
        }
        const bars = new T.Group();
        engine.add(bars);
        const satellites: InstanceType<typeof T.Mesh>[] = [];
        for (let i = 0; i < 13; i++) {
          const mesh = new T.Mesh(
            new T.BoxGeometry(0.085, 0.25 + (i % 4) * 0.1, 0.085),
            i % 3 ? silver : luminous,
          );
          satellites.push(mesh);
          bars.add(mesh);
        }
        // An understated orbital field, with deterministic positions to avoid flashing.
        const positions = new Float32Array((compact ? 100 : 240) * 3);
        for (let i = 0; i < positions.length / 3; i++) {
          const a = i * 2.39996,
            r = 2.9 + (i % 17) / 12;
          positions[i * 3] = Math.cos(a) * r;
          positions[i * 3 + 1] = Math.sin(a) * r * 0.65;
          positions[i * 3 + 2] = Math.sin(i * 1.41) * 2;
        }
        const particleGeometry = new T.BufferGeometry();
        particleGeometry.setAttribute("position", new T.BufferAttribute(positions, 3));
        const particles = new T.Points(
          particleGeometry,
          new T.PointsMaterial({
            size: 0.017,
            color: 0xc9e9cf,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true,
          }),
        );
        engine.add(particles);
        let pointerX = 0,
          pointerY = 0,
          rotation = 0,
          frame = 0,
          lastTime = 0;
        let visible = true;
        let hasRendered = false;
        let lastRender = 0;
        const journey = element.closest(".ds-journey");
        const marketSection = journey?.querySelector<HTMLElement>("#markets");
        const engineSection = journey?.querySelector<HTMLElement>("#engine");
        let marketTop = 0;
        let engineTop = 0;
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const resize = () => {
          marketTop = marketSection?.offsetTop ?? 0;
          engineTop = engineSection?.offsetTop ?? 0;
          camera.aspect = element.clientWidth / Math.max(1, element.clientHeight);
          camera.updateProjectionMatrix();
          renderer.setSize(element.clientWidth, element.clientHeight);
        };
        const onPointer = (event: PointerEvent) => {
          pointerX = (event.clientX / window.innerWidth - 0.5) * 0.3;
          pointerY = (event.clientY / window.innerHeight - 0.5) * 0.2;
        };
        const observer = new IntersectionObserver(([entry]) => {
          visible = !!entry?.isIntersecting;
          schedule();
        });
        observer.observe(element);
        const size = new ResizeObserver(resize);
        size.observe(element);
        resize();
        const draw = (time: number) => {
          frame = 0;
          if (disposed || document.hidden || !visible) return;
          const reduced = motion.matches || controls.current.paused;
          if (hasRendered && !reduced && time - lastRender < 1000 / 30) {
            schedule();
            return;
          }
          lastRender = time;
          const delta = Math.min((time - lastTime) / 1000, 0.04);
          lastTime = time;
          if (!reduced) rotation += delta * 0.13;
          const height = window.innerHeight;
          const scroll = journey ? -journey.getBoundingClientRect().top : window.scrollY;
          const toMarkets =
            variant === "compact"
              ? 0
              : T.MathUtils.smoothstep(scroll, marketTop - height * 0.6, marketTop - height * 0.2);
          const back =
            variant === "compact"
              ? 0
              : T.MathUtils.smoothstep(scroll, engineTop - height * 0.6, engineTop - height * 0.2);
          const progress = variant === "compact" ? Math.min(scroll / height, 1) : toMarkets + back;
          const isMobile = window.innerWidth < 760;
          // Keep the compact scene inside its own column, clear of text and controls.
          engine.position.x =
            variant === "compact" || isMobile ? 0 : 2.5 - toMarkets * 5 + back * 5;
          engine.position.y = isMobile ? 0.05 : -0.05;
          const scale =
            variant === "compact" ? Math.min(0.92, camera.aspect) : isMobile ? 0.85 : 0.82;
          engine.scale.setScalar(scale);
          engine.rotation.y =
            (reduced ? 0.1 : rotation + pointerX) +
            (reduced ? 0 : progress * 0.8) +
            controls.current.market * 0.16;
          engine.rotation.x = reduced ? 0.08 : pointerY * 0.5;
          crystal.rotation.y = rotation * 0.65;
          core.rotation.set(rotation * 0.6, -rotation, 0.3);
          rings.forEach((ring, index) => {
            ring.rotation.z = index * 0.6 - 0.5 + rotation * (index % 2 ? -0.7 : 0.5);
            ring.position.y = (index - 1) * back * 0.48;
          });
          satellites.forEach((bar, index) => {
            const angle = (index / 13) * Math.PI * 2 + rotation * 0.2;
            const radius = 2.65 + back * 0.18;
            bar.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
            bar.rotation.z = angle - Math.PI / 2;
            bar.scale.y = 1 + back * 1.6;
          });
          renderer.render(scene, camera);
          if (!hasRendered) {
            hasRendered = true;
            setReady(true);
          }
          if (!reduced) schedule();
        };
        function schedule() {
          if (!frame && !disposed && visible && !document.hidden)
            frame = requestAnimationFrame(draw);
        }
        const onContextLost = (event: Event) => {
          event.preventDefault();
          setReady(false);
          hasRendered = false;
          visible = false;
          cancelAnimationFrame(frame);
        };
        const onContextRestored = () => {
          visible = true;
          schedule();
        };
        const onVisibility = () => {
          if (document.hidden) {
            cancelAnimationFrame(frame);
            frame = 0;
          } else schedule();
        };
        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        document.addEventListener("visibilitychange", onVisibility);
        motion.addEventListener("change", schedule);
        renderer.domElement.addEventListener("webglcontextlost", onContextLost);
        renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
        // React controls can change even while the scene is paused.
        element.addEventListener("scene-update", schedule);
        schedule();
        cleanup = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          size.disconnect();
          window.removeEventListener("pointermove", onPointer);
          window.removeEventListener("scroll", schedule);
          window.removeEventListener("resize", schedule);
          document.removeEventListener("visibilitychange", onVisibility);
          motion.removeEventListener("change", schedule);
          element.removeEventListener("scene-update", schedule);
          renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
          renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
          scene.traverse((object) => {
            const mesh = object as InstanceType<typeof T.Mesh>;
            mesh.geometry?.dispose();
            if (mesh.material)
              (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) =>
                material.dispose(),
              );
          });
          environment.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        /* The CSS fallback remains visible when WebGL is unavailable. */
      });
    };
    const idle = "requestIdleCallback" in window
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : null;
    const timer = idle === null ? window.setTimeout(start, 150) : null;
    return () => {
      disposed = true;
      if (idle !== null) window.cancelIdleCallback(idle);
      if (timer !== null) window.clearTimeout(timer);
      cleanup();
    };
  }, [variant]);

  useEffect(() => {
    host.current?.dispatchEvent(new Event("scene-update"));
  }, [paused, market]);
  return (
    <div className={`ds-scene ds-scene--${variant} ${ready ? "is-ready" : ""} ${paused ? "is-paused" : ""}`} aria-hidden="true">
      <div className="ds-scene-glow" />
      <div className="ds-scene-fallback">
        <span />
        <span />
        <span />
        <i />
      </div>
      <div ref={host} className="ds-scene-canvas" />
      <div className="ds-scene-motion">
        <div className="ds-scene-orbit orbit-a"><i /><i /><i /></div>
        <div className="ds-scene-orbit orbit-b"><i /><i /></div>
        <div className="ds-scene-scan" />
        <div className="ds-scene-hud hud-a"><span>13F</span><b>MODEL</b></div>
        <div className="ds-scene-hud hud-b"><span>5X</span><b>MARKETS</b></div>
        <div className="ds-scene-hud hud-c"><span>LIVE</span><b>RESEARCH</b></div>
      </div>
      <div className="ds-scene-grid" />
    </div>
  );
}
