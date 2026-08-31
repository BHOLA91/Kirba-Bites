/**
 * pages/LandingPage.jsx  —  Kirba Bites landing page
 * ──────────────────────────────────────────────────────────────────
 * Composes HeroSection + ProblemStatement.
 * No GSAP / ScrollTrigger — section-level animations are handled
 * inside each child component using IntersectionObserver.
 */

import { useState, useEffect } from "react";

import Loader           from "../components/common/Loader";
import HeroSection      from "../components/sections/HeroSection";
import ProblemStatement from "../components/sections/ProblemStatement";

export default function LandingPage() {
  // ── Loader state ──────────────────────────────────────────────
  const [showLoader,    setShowLoader]    = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [pageVisible,   setPageVisible]   = useState(false);

  useEffect(() => {
    const fadeOut = setTimeout(() => setLoaderVisible(false), 1800);
    const unmount = setTimeout(() => {
      setShowLoader(false);
      setPageVisible(true);
    }, 2300);
    return () => { clearTimeout(fadeOut); clearTimeout(unmount); };
  }, []);

  return (
    <>
      {showLoader && <Loader isVisible={loaderVisible} />}

      <main
        style={{
          opacity:    pageVisible ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      >
        <HeroSection />
        <ProblemStatement />
      </main>
    </>
  );
}
