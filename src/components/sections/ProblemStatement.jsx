/**
 * components/sections/ProblemStatement.jsx
 * ──────────────────────────────────────────────────────────────────
 * Cream background section below the hero. Layout: two columns —
 *  LEFT  — bowl image, settled in place with a gentle fade+slide entrance
 *  RIGHT — problem copy (eyebrow, heading, body, stats, callout)
 *
 * On mobile: stacks vertically (bowl on top, copy below).
 *
 * Entrance animations use IntersectionObserver + CSS transitions —
 * no GSAP, no ScrollTrigger.
 * prefers-reduced-motion: transitions are skipped (elements shown immediately).
 */

import { useRef, useEffect, useState } from "react";
import bowlImg from "../../assets/images/bowl-curry.jpg";

// ── Problem copy ──────────────────────────────────────────────────
const COPY_BLOCKS = [
  {
    type: "eyebrow",
    text: "The problem on every campus",
  },
  {
    type: "heading",
    text: "Finding food here is still word-of-mouth.",
  },
  {
    type: "body",
    text: "There are dozens of canteens, stalls, and small restaurants scattered across campus — but unless you already know someone who has the number for the good biryani place near Block D, you're walking there in the heat just to check if it's open.",
  },
  {
    type: "body",
    text: "New students rely on seniors. Seniors forget half the good spots. And new stalls that open mid-semester never get discovered. Phone numbers get shared in group chats, get outdated, and disappear.",
  },
  {
    type: "stat",
    number: "0",
    label: "Centralized places to browse campus food options",
  },
  {
    type: "stat",
    number: "∞",
    label: "Times you've walked to a stall only to find it closed",
  },
  {
    type: "callout",
    text: "Kirba Bites fixes this. Every restaurant, stall, and canteen on campus — one place. No delivery fee. No app download. Browse, pick, call.",
  },
];

// ── FadeIn — IntersectionObserver-powered fade+slide wrapper ──────
// Observes its child once; when it enters the viewport it transitions
// from opacity:0 + translateY to fully visible.
// Reduced-motion: starts fully visible, no transition.
function FadeIn({ children, delay = 0, className = "" }) {
  const ref               = useRef(null);
  const [visible, setVisible] = useState(false);
  const prefersReduced    = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    if (prefersReduced.current) { setVisible(true); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el); // fire once
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:          visible ? 1 : 0,
        transform:        visible ? "translateY(0)" : "translateY(28px)",
        transition:       prefersReduced.current
          ? "none"
          : `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function ProblemStatement() {
  return (
    <section
      id="problem-statement"
      aria-labelledby="ps-heading"
      className="relative bg-cream py-24 md:py-32 px-6 sm:px-10 lg:px-20"
    >
      {/* Top separator from dark hero */}
      <div className="absolute top-0 left-0 right-0 h-px bg-cream-muted" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">

        {/* ── LEFT — Bowl image ──────────────────────────────── */}
        <FadeIn delay={0} className="flex justify-center md:justify-end">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            {/* Warm glow ring behind bowl */}
            <div
              className="absolute inset-0 rounded-full scale-110 opacity-10"
              style={{ background: "radial-gradient(circle, #D9711A 0%, transparent 70%)" }}
              aria-hidden="true"
            />
            <img
              src={bowlImg}
              alt="A bowl of warm curry — the kind of food you'll find on campus"
              className="
                relative w-full rounded-[2.5rem]
                shadow-[0_24px_80px_rgba(29,59,42,0.18)]
                object-cover aspect-square
              "
              loading="lazy"
              decoding="async"
            />
            {/* Floating label */}
            <div className="
              absolute -bottom-4 -right-4
              bg-forest text-cream
              font-body text-xs font-semibold tracking-widest uppercase
              px-4 py-2 rounded-full shadow-lg
            ">
              Campus food
            </div>
          </div>
        </FadeIn>

        {/* ── RIGHT — Problem copy ───────────────────────────── */}
        <div className="flex flex-col gap-6">

          {COPY_BLOCKS.map((block, i) => {
            // Stats are collected and rendered separately below
            if (block.type === "stat") return null;

            if (block.type === "eyebrow") return (
              <FadeIn key={i} delay={80}>
                <p className="text-burntorange font-body font-semibold text-xs uppercase tracking-[0.22em]">
                  {block.text}
                </p>
              </FadeIn>
            );

            if (block.type === "heading") return (
              <FadeIn key={i} delay={150}>
                <h2
                  id="ps-heading"
                  className="font-display font-bold text-forest text-3xl sm:text-4xl leading-tight"
                >
                  {block.text}
                </h2>
              </FadeIn>
            );

            if (block.type === "body") return (
              <FadeIn key={i} delay={220 + i * 60}>
                <p className="font-body text-ink-muted text-base leading-relaxed">
                  {block.text}
                </p>
              </FadeIn>
            );

            if (block.type === "callout") return (
              <FadeIn key={i} delay={300}>
                <blockquote className="
                  border-l-[3px] border-burntorange pl-5
                  text-forest font-body font-semibold text-base leading-relaxed
                ">
                  {block.text}
                </blockquote>
              </FadeIn>
            );

            return null;
          })}

          {/* Stats row */}
          <FadeIn delay={260}>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {COPY_BLOCKS.filter((b) => b.type === "stat").map((stat, i) => (
                <div
                  key={i}
                  className="
                    bg-cream-dark border border-cream-muted
                    rounded-2xl p-5 flex flex-col gap-1
                  "
                >
                  <span className="font-display font-black text-forest text-4xl leading-none">
                    {stat.number}
                  </span>
                  <span className="font-body text-ink-muted text-xs leading-snug">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
