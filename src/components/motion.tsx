"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Motion system for the whole site: one shared easing vocabulary (expo-out),
 * position-driven reveals, scroll-linked parallax, stacked "receding" panels,
 * scramble/draw/fill text effects, chapter navigation, a label-morphing cursor
 * and Lenis smooth scroll.
 *
 * Everything sits inside gsap.matchMedia, so it is skipped for reduced-motion users,
 * and the pointer-only effects are skipped on touch devices.
 */
const EASE = "expo.out"; // ≈ cubic-bezier(.16,1,.3,1): one easing curve across the whole site.

/** Blocks that rise into view. Step rows join only when they are not stacked. */
const REVEAL = [
  ".service-card",
  ".product-detail",
  ".page-section",
  ".faq-list > h2",
  ".faq-list details",
  ".contact-page-grid > *",
  ".security-page-visual",
  ".assessment",
].join(",");

/** Cursor labels for clickable media that benefit from a hint. */
const CURSOR_LABELS: [string, string][] = [
  [".products-section a", "View"],
  [".proof-products a", "View"],
];

let activeLenis: Lenis | null = null;

const all = <T extends HTMLElement = HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector);

function chapterLabel(el: HTMLElement, index: number) {
  return (
    el.getAttribute("aria-label") ||
    el.querySelector(".eyebrow")?.textContent?.trim() ||
    el.querySelector("h2")?.textContent?.trim() ||
    (el.classList.contains("first-viewport") || el.classList.contains("page-intro")
      ? "Intro"
      : `Section ${index + 1}`)
  );
}

export function PageMotion() {
  const pathname = usePathname();

  // ── Route-level motion: re-runs on every navigation. ────────────────────────
  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        wide: "(min-width: 900px)",
        desk: "(hover: hover) and (pointer: fine) and (min-width: 1100px)",
      },
      (ctx) => {
        const { motion, wide, desk } = ctx.conditions as { motion: boolean; wide: boolean; desk: boolean };
        if (!motion) return;

        const splits: SplitText[] = [];
        const scrambled: [HTMLElement, string][] = [];
        const extras: HTMLElement[] = [];
        const maskLines = (el: HTMLElement, animate: (lines: Element[]) => gsap.core.Animation) =>
          splits.push(
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) => animate(self.lines),
            }),
          );

        // 1 ── Intro: headline lines rise out of a mask, supporting copy follows.
        all(".page-intro h1, .home-hero h1, .not-found h1").forEach((h) =>
          maskLines(h, (lines) =>
            gsap.from(lines, { yPercent: 115, duration: 1.2, stagger: 0.12, delay: 0.1, ease: EASE }),
          ),
        );
        const introCopy = all(".page-intro > p, .page-intro .btn, .not-found > p, .not-found .btn");
        if (introCopy.length)
          gsap.from(introCopy, {
            opacity: 0,
            y: 22,
            duration: 1,
            stagger: 0.12,
            delay: 0.45,
            ease: EASE,
            clearProps: "opacity,transform",
          });

        // 2 ── Reveals, with each section rule drawing in.
        const stacked = wide && !!document.querySelector(".steps-list");
        const items = all(stacked ? REVEAL : `${REVEAL},.step-row`);
        const drawn = all(".page-section, .step-row").filter((el) => items.includes(el));
        if (items.length) {
          gsap.set(items, { opacity: 0, y: 40 });
          if (drawn.length) gsap.set(drawn, { "--draw": 0 });
          ScrollTrigger.batch(items, {
            start: "top 92%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                "--draw": 1,
                duration: 1.1,
                stagger: 0.12,
                ease: EASE,
                overwrite: true,
                clearProps: "transform",
              }),
          });
        }
        all(".page-section h2").forEach((h) =>
          maskLines(h, (lines) =>
            gsap.from(lines, {
              yPercent: 110,
              duration: 1,
              stagger: 0.1,
              ease: EASE,
              scrollTrigger: { trigger: h, start: "top 90%", once: true },
            }),
          ),
        );
        all(".page-section ul").forEach((ul) =>
          gsap.from(ul.children, {
            opacity: 0,
            x: -18,
            duration: 0.8,
            stagger: 0.09,
            ease: EASE,
            scrollTrigger: { trigger: ul, start: "top 92%", once: true },
          }),
        );

        // 3 ── Stacked panels ("How we build"): each step slides over the last, which recedes (dimmed by an overlay so it stays opaque).
        if (stacked) {
          const rows = all(".steps-list .step-row");
          rows.forEach((row, i) => {
            gsap.from(row.children, {
              opacity: 0,
              y: 26,
              duration: 0.9,
              stagger: 0.1,
              ease: EASE,
              scrollTrigger: { trigger: row, start: "top 88%", once: true },
            });
            const next = rows[i + 1];
            if (!next) return;
            gsap.to(row, {
              scale: 0.94,
              "--dim": 0.72,
              ease: "none",
              scrollTrigger: { trigger: next, start: "top 80%", end: "top 20%", scrub: true },
            });
          });
        }

        // 4 ── Closing statement: words fill from outline to solid as you scroll (fill-word effect).
        all(".page-closing h2").forEach((h) => {
          const color = getComputedStyle(h).color;
          const [r, g, b] = gsap.utils.splitColor(color);
          const s = SplitText.create(h, { type: "words" });
          splits.push(s);
          gsap.set(s.words, {
            color: `rgba(${r},${g},${b},0)`,
            webkitTextStrokeWidth: "1.2px",
            webkitTextStrokeColor: color,
          });
          gsap.to(s.words, {
            color,
            webkitTextStrokeWidth: "0px",
            stagger: 0.14,
            duration: 0.6,
            ease: "none",
            scrollTrigger: { trigger: h, start: "top 88%", end: "bottom 60%", scrub: 0.4 },
          });
        });
        all(".page-closing").forEach((el) =>
          gsap.fromTo(
            el,
            { clipPath: "inset(0% 7% 0% 7%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 98%", end: "top 55%", scrub: true },
            },
          ),
        );

        // 5 ── Mono labels scramble into place (scramble effect).
        all(".inner-main .eyebrow, .not-found .eyebrow")
          .filter((el) => !el.closest(".assessment") && !el.children.length)
          .forEach((el) => {
            const final = el.textContent ?? "";
            scrambled.push([el, final]);
            ScrollTrigger.create({
              trigger: el,
              start: "top 92%",
              once: true,
              onEnter: () =>
                gsap.to(el, {
                  duration: 1,
                  ease: "none",
                  scrambleText: { text: final, chars: "XO/+·01", speed: 0.6, revealDelay: 0.15 },
                }),
            });
          });

        // 6 ── Imagery opens from a clipped, zoomed state, then drifts (parallax).
        all(".product-detail img, .founder-section img, .security-page-visual img").forEach((img) => {
          gsap.fromTo(
            img,
            { clipPath: "inset(12% 12% 12% 12%)", scale: 1.12 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: 1.4,
              ease: EASE,
              scrollTrigger: { trigger: img, start: "top 90%", once: true },
            },
          );
          gsap.fromTo(
            img,
            { y: -28 },
            {
              y: 28,
              ease: "none",
              scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 0.5 },
            },
          );
        });
        all(".hero-visual").forEach((el) =>
          gsap.to(el, {
            yPercent: -7,
            ease: "none",
            scrollTrigger: { trigger: el, start: 0, end: "+=700", scrub: 0.6 },
          }),
        );
        all(".ai-page-visual").forEach((el) =>
          gsap.fromTo(
            el,
            { yPercent: 5 },
            {
              yPercent: -5,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          ),
        );

        // 7 ── Footer.
        if (document.querySelector(".footer-column"))
          gsap.from(".footer-column, .footer-legal", {
            opacity: 0,
            y: 28,
            duration: 0.9,
            stagger: 0.08,
            ease: EASE,
            scrollTrigger: { trigger: ".site-footer", start: "top 94%", once: true },
          });

        // 8 ── Chapter dots : jump between sections, with the active one tracked.
        if (desk) {
          const home = !!document.querySelector(".home-main");
          const sel = home
            ? ".home-main .first-viewport, .home-main .content-fragment > section, .home-main .demo-section, .home-main .products-section"
            : ".inner-main .page-intro, .inner-main .page-section, .inner-main .service-grid, .inner-main .steps-list, .inner-main .faq-list, .inner-main .product-detail, .inner-main .contact-page-grid, .inner-main .assessment, .inner-main .page-closing";
          const targets = all(sel);
          if (targets.length >= 4) {
            const nav = document.createElement("nav");
            nav.className = "cs-chapters";
            nav.setAttribute("aria-label", "Page sections");
            const buttons = targets.map((t, i) => {
              const label = chapterLabel(t, i);
              const b = document.createElement("button");
              b.type = "button";
              b.setAttribute("aria-label", `Go to ${label}`);
              b.innerHTML = "<span></span><i></i>";
              (b.firstChild as HTMLElement).textContent = label;
              b.addEventListener("click", () => {
                if (activeLenis) activeLenis.scrollTo(t, { offset: -90, duration: 1.4 });
                else t.scrollIntoView({ behavior: "smooth", block: "start" });
              });
              nav.append(b);
              return b;
            });
            document.body.append(nav);
            extras.push(nav);
            gsap.from(nav, { opacity: 0, x: 12, duration: 1, delay: 1, ease: EASE });
            targets.forEach((t, i) =>
              ScrollTrigger.create({
                trigger: t,
                start: "top 55%",
                end: "bottom 55%",
                onToggle: (self) => {
                  if (self.isActive) buttons.forEach((b, j) => b.classList.toggle("is-active", i === j));
                },
              }),
            );
          }
        }

        // Layout shifts from fonts/images move trigger positions, so re-measure.
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        document.fonts?.ready.then(refresh);
        const timer = window.setTimeout(refresh, 400);

        return () => {
          window.removeEventListener("load", refresh);
          window.clearTimeout(timer);
          splits.forEach((s) => s.revert());
          scrambled.forEach(([el, text]) => {
            gsap.killTweensOf(el);
            el.textContent = text;
          });
          extras.forEach((el) => el.remove());
        };
      },
    );
    return () => mm.revert();
  }, [pathname]);

  // ── Smooth scroll, shared with ScrollTrigger. ──
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
      activeLenis = lenis;
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
        activeLenis = null;
      };
    });
    return () => mm.revert();
  }, []);

  // Lenis caches page height; re-measure after each navigation.
  useEffect(() => {
    activeLenis?.resize();
  }, [pathname]);

  // ── Pointer layer and global behaviour. ─────────────────────────────────────
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // FAQ answers ease in; opening one changes page height, so re-measure.
      let t = 0;
      const onToggle = (e: Event) => {
        const d = e.target as HTMLElement;
        if (d.tagName !== "DETAILS") return;
        window.clearTimeout(t);
        t = window.setTimeout(() => {
          activeLenis?.resize();
          ScrollTrigger.refresh();
        }, 350);
        const p = (d as HTMLDetailsElement).open ? d.querySelector("p") : null;
        if (p) gsap.fromTo(p, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE });
      };
      document.addEventListener("toggle", onToggle, true);
      return () => {
        window.clearTimeout(t);
        document.removeEventListener("toggle", onToggle, true);
      };
    });

    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      // Cursor ring that grows over controls and becomes a label pill over tagged media.
      const ring = document.createElement("div");
      ring.className = "cs-cursor";
      ring.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      ring.append(label);
      document.body.append(ring);
      const qx = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3.out" });
      const qy = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3.out" });
      let magnet: HTMLElement | null = null;
      const release = (el: HTMLElement | null) => {
        if (el) gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,.45)", overwrite: "auto" });
      };
      const move = (e: PointerEvent) => {
        qx(e.clientX);
        qy(e.clientY);
        ring.classList.add("is-on");
        const target = e.target instanceof Element ? e.target : null;
        const labelled = target?.closest("[data-cursor-label]");
        const text =
          labelled?.getAttribute("data-cursor-label") ||
          CURSOR_LABELS.find(([s]) => target?.closest(s))?.[1] ||
          "";
        const hot = !!target?.closest("a, button, summary, input, select, textarea, label");
        if (label.textContent !== text) label.textContent = text;
        ring.classList.toggle("is-label", !!text);
        ring.classList.toggle("is-hot", hot && !text);
        // Magnetic buttons lean toward the pointer.
        const btn = target?.closest<HTMLElement>(".btn:not(:disabled)") ?? null;
        if (btn !== magnet) {
          release(magnet);
          magnet = btn;
        }
        if (btn) {
          const r = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: gsap.utils.clamp(-8, 8, (e.clientX - (r.left + r.width / 2)) * 0.22),
            y: gsap.utils.clamp(-6, 6, (e.clientY - (r.top + r.height / 2)) * 0.3),
            duration: 0.35,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      };
      const leave = () => {
        ring.classList.remove("is-on");
        release(magnet);
        magnet = null;
      };
      document.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        document.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
        ring.remove();
      };
    });
    return () => mm.revert();
  }, []);

  return null;
}
