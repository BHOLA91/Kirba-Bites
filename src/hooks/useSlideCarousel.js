/**
 * hooks/useSlideCarousel.js  —  Reusable slide-based carousel hook
 * ──────────────────────────────────────────────────────────────────
 * Manages the state and timing for a translateX-sliding carousel.
 * Supports any number of items and a configurable "items visible at once"
 * count (with peek via fractional values like 2.15).
 *
 * Returns:
 *   index          — current lead slide index (0-based)
 *   goTo(n)        — jump to slide n
 *   goNext()       — advance one slide
 *   goPrev()       — go back one slide
 *   trackRef       — ref to attach to the sliding track element
 *   containerRef   — ref to attach to the overflow:hidden container
 *   translateX     — computed string for the track's transform style
 *   itemWidthPct   — each item's width as a % of the container
 *   pauseHandlers  — { onMouseEnter, onMouseLeave, onFocus, onBlur }
 *                    spread onto the section element to pause/resume
 *
 * Usage:
 *   const carousel = useSlideCarousel({
 *     count: items.length,
 *     visibleCount: 3,    // how many full cards show at once
 *     gap: 20,            // gap between cards in px (match your CSS gap)
 *     autoMs: 4500,       // ms between auto-advances (0 = off)
 *     loop: true,
 *   });
 *
 *   <div ref={carousel.containerRef} style={{ overflow: "hidden" }}>
 *     <div
 *       ref={carousel.trackRef}
 *       style={{
 *         display: "flex",
 *         gap: "20px",
 *         transform: carousel.translateX,
 *         transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
 *         willChange: "transform",
 *       }}
 *     >
 *       {items.map(item => (
 *         <div style={{ width: carousel.itemWidthPct, flexShrink: 0 }}>...</div>
 *       ))}
 *     </div>
 *   </div>
 */

import { useState, useEffect, useRef, useCallback } from "react";

export function useSlideCarousel({
  count      = 0,
  visibleCount = 3,   // how many items fully visible (can be fractional for peek)
  gap        = 20,    // gap between cards in px
  autoMs     = 4500,  // auto-advance interval in ms (0 = disabled)
  loop       = true,
} = {}) {
  const [index,  setIndex]  = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);
  const trackRef     = useRef(null);

  // Respect prefers-reduced-motion
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Navigation ────────────────────────────────────────────────
  const maxIndex = loop ? count - 1 : Math.max(0, count - Math.floor(visibleCount));

  const goTo = useCallback((n) => {
    let next = n;
    if (loop) {
      next = ((n % count) + count) % count;
    } else {
      next = Math.max(0, Math.min(n, maxIndex));
    }
    setIndex(next);
  }, [count, loop, maxIndex]);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  // ── Auto-advance ──────────────────────────────────────────────
  useEffect(() => {
    if (!autoMs || paused || count <= 1 || prefersReduced) return;
    const id = setInterval(goNext, autoMs);
    return () => clearInterval(id);
  }, [autoMs, paused, count, goNext, prefersReduced]);

  // ── Compute translateX ────────────────────────────────────────
  // Each item's width = (containerWidth - gaps) / visibleCount.
  // Slide amount per step = itemWidth + gap.
  // We use a percentage-of-container approach so it works without
  // measuring the DOM — containerWidth = 100%.
  //
  //   itemWidth%     = (100% - gap*(visibleCount-1)/containerWidth) / visibleCount
  //
  // Since gap is in px but the container is unknown px, we approximate:
  //   slideStep% ≈ 100 / visibleCount  (exact when gap=0)
  //
  // For the real calculation we need the container width. We read it
  // from containerRef on resize. Fallback: 100/visibleCount.
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    // Initial read
    setContainerW(containerRef.current.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // itemWidth in px (what each card will be set to)
  const itemWidthPx = containerW
    ? (containerW - gap * (visibleCount - 1)) / visibleCount
    : 0;

  // Slide step = itemWidth + gap (px per slide)
  const slideStepPx = itemWidthPx + gap;

  // translateX in px (negative = shift left)
  const offsetPx = -(index * slideStepPx);

  // Expressed as % of the TRACK width so we don't need to know it
  // → we use px directly since we know both values
  const translateX = `translateX(${offsetPx}px)`;

  // itemWidth as a style value (px string) for each child to use
  const itemWidthStyle = containerW ? `${itemWidthPx}px` : `${100 / visibleCount}%`;

  // ── Pause/resume handlers ─────────────────────────────────────
  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus:      () => setPaused(true),
    onBlur:       () => setPaused(false),
  };

  return {
    index,
    goTo,
    goNext,
    goPrev,
    containerRef,
    trackRef,
    translateX,
    itemWidthStyle,
    prefersReduced,
    pauseHandlers,
    count,
    maxIndex,
  };
}
