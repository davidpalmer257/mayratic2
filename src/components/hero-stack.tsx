"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const phases = ["Discover", "Design", "Build", "Live"];

export function HeroStack() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef({ value: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const drawRef = useRef<() => void>(null);
  const manual = useRef(false); // true once the visitor takes over the animation
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let width = 600,
      height = 510;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio, 2);
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(el);
    resize();
    const points = Array.from({ length: 650 }, (_, i) => ({
      u: ((i * 7919) % 1009) / 1009,
      v: ((i * 3571) % 1013) / 1013,
      phase: i * 2.39996,
    }));
    let lastPhase = -1;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width / 610, height / 500),
        cx = width * 0.45,
        cy = height * 0.49;
      const t = progress.current.value;
      // Keep the phase control in step with the animation until the visitor takes over.
      if (!manual.current) {
        const phase = Math.round(t * 3);
        if (phase !== lastPhase) {
          lastPhase = phase;
          setSelected(phase);
        }
      }
      const project = (u: number, v: number, z: number): [number, number] => [
        cx + (u - v) * 175 * scale,
        cy + (u + v - 1) * 91 * scale + z * scale,
      ];
      const line = (a: [number, number], b: [number, number], color: string) => {
        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      };
      const levels = [-135, -45, 45, 135];
      const colors = ["#bdb4f8", "#a2c0c7", "#b8cfc4", "#b9baa9"];
      levels.forEach((z, layer) => {
        const corners = [project(0, 0, z), project(1, 0, z), project(1, 1, z), project(0, 1, z)];
        ctx.beginPath();
        corners.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
        ctx.closePath();
        ctx.fillStyle = layer === 0 ? "#fafaf86b" : "#fafaf828";
        ctx.fill();
        ctx.strokeStyle = colors[layer] + "a0";
        ctx.lineWidth = 0.7;
        ctx.stroke();
        if (layer < 3)
          corners.forEach((c, i) => line(c, project([0, 1, 1, 0][i], [0, 0, 1, 1][i], z + 90), "#dad8ce90"));
        for (let k = 1; k < 5; k++) {
          line(project(k / 5, 0, z), project(k / 5, 1, z), "#dad8ce22");
          line(project(0, k / 5, z), project(1, k / 5, z), "#dad8ce22");
        }
        points.forEach((p, i) => {
          const drift = Math.sin(p.phase + t * 6.28) * 0.017 * (1 - t * 0.7);
          const [x, y] = project(p.u + drift, p.v + drift, z);
          ctx.fillStyle = colors[layer];
          ctx.globalAlpha = 0.25 + ((i * 17) % 10) / 16;
          ctx.beginPath();
          ctx.ellipse(x, y, 1.15 * scale, 0.55 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      });
      const [mx, my] = project(0.5, 0.5, -135);
      ctx.save();
      ctx.translate(mx, my);
      ctx.transform(1, 0.52, -1, 0.52, 0, 0);
      ctx.fillStyle = "#8566ec";
      ctx.fillRect(-18, -18, 36, 36);
      ctx.fillStyle = "#fafaf8";
      ctx.font = "500 23px Saans, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("M", 0, 1);
      ctx.restore();
      const scanY = -135 + t * 270;
      const edges = [project(0, 0, scanY), project(1, 0, scanY), project(1, 1, scanY), project(0, 1, scanY)];
      ctx.beginPath();
      edges.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
      ctx.closePath();
      ctx.strokeStyle = "#a392f3";
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    progress.current.value = 1;
    if (!reduced)
      tween.current = gsap.fromTo(
        progress.current,
        { value: 0 },
        { value: 1, duration: 10, ease: "none", repeat: -1, repeatDelay: 1, yoyo: true },
      );
    // Only render while the canvas is on screen; otherwise it would repaint ~2,600 points every frame for nothing.
    let running = false;
    const run = (on: boolean) => {
      if (reduced) return;
      if (on && !running) {
        gsap.ticker.add(draw);
        running = true;
      }
      if (!on && running) {
        gsap.ticker.remove(draw);
        running = false;
      }
      tween.current?.paused(!on || manual.current);
    };
    const visibility = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    visibility.observe(el);
    drawRef.current = draw;
    draw();
    return () => {
      observer.disconnect();
      visibility.disconnect();
      gsap.ticker.remove(draw);
      tween.current?.kill();
    };
  }, []);
  const scrub = (value: number) => {
    manual.current = true;
    setSelected(value);
    tween.current?.pause();
    gsap.to(progress.current, {
      value: value / 3,
      duration: 0.8,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => drawRef.current?.(),
    });
  };
  return (
    <div
      className="context-stack"
      role="group"
      aria-label="Four connected layers of a software project, from discovery to production"
    >
      <canvas ref={canvas} aria-hidden="true" />
      <div className="stack-source source-one">
        <i className="source-dot lilac" />
        Requirements.md <span>updated</span>
      </div>
      <div className="stack-source source-two">
        <i className="source-dot blue" />
        Your workflow <span>connected</span>
      </div>
      <div className="stack-source source-three">
        <i className="source-dot green" />
        Production <span>live</span>
      </div>
      <div className="stack-axis" role="group" aria-label="Explore the build phases">
        <span className="axis-rule" />
        {phases.map((phase, i) => (
          <button
            key={phase}
            className={selected === i ? "active" : ""}
            onClick={() => scrub(i)}
            aria-pressed={selected === i}
          >
            <span>{phase}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
