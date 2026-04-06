"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TOTAL_FRAMES = 192;
const FRAME_PATH = (i: number) => `/frames/frame_${i}.jpg`;

interface StoryBeat {
  heading: string;
  subtext: string;
  rangeStart: number;
  rangeEnd: number;
}

const storyBeats: StoryBeat[] = [
  {
    heading: "LandChain",
    subtext: "Secure property ownership on blockchain",
    rangeStart: 0,
    rangeEnd: 0.2,
  },
  {
    heading: "Register Properties",
    subtext: "AI-powered document verification",
    rangeStart: 0.22,
    rangeEnd: 0.4,
  },
  {
    heading: "Blockchain Verified",
    subtext: "Tamper-proof, immutable records",
    rangeStart: 0.5,
    rangeEnd: 0.7,
  },
  {
    heading: "Transfer Ownership",
    subtext: "Secure peer-to-peer transactions",
    rangeStart: 0.8,
    rangeEnd: 0.95,
  },
];

export function ScrollytellingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Preload all frames
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i + 1); // frames are 1-indexed
      img.onload = () => {
        loaded++;
        setLoadProgress(Math.floor((loaded / TOTAL_FRAMES) * 100));
        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        loaded++;
        setLoadProgress(Math.floor((loaded / TOTAL_FRAMES) * 100));
        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };
      images[i] = img;
    }

    imagesRef.current = images;
  }, []);

  // Draw frame on canvas
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Use CSS pixel dimensions (ctx is already scaled by DPR)
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Cover fit (fill entire viewport, crop overflow)
    const scale = Math.max(cssW / imgW, cssH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (cssW - drawW) / 2;
    const offsetY = (cssH - drawH) / 2;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }, []);

  // Resize canvas to fill viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      // Redraw current frame after resize
      drawFrame(currentFrameRef.current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  // Subscribe to scroll and render frames
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (progress) => {
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          drawFrame(frameIndex);
        });
      }
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(rafRef.current);
    };
  }, [scrollYProgress, drawFrame]);

  // Draw first frame once loaded
  useEffect(() => {
    if (isLoaded) {
      drawFrame(0);
    }
  }, [isLoaded, drawFrame]);

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "500vh" }}
    >
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#0f1513]">
          <div className="mb-6 text-5xl font-bold tracking-tight" style={{ color: "#EEEFE0", fontFamily: "Inter, sans-serif" }}>
            LandChain
          </div>
          <div className="relative h-1 w-64 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
              style={{
                width: `${loadProgress}%`,
                background: "linear-gradient(90deg, #819A91, #A7C1A8)",
              }}
            />
          </div>
          <p className="mt-3 text-sm" style={{ color: "#A7C1A8" }}>
            Loading experience... {loadProgress}%
          </p>
        </div>
      )}

      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Dark green gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #0f1513 0%, #1a2e1a 50%, #0f1513 100%)",
          }}
        />

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.8s ease" }}
        />

        {/* Vignette overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(15,21,19,0.6) 100%)",
          }}
        />

        {/* Story text overlays */}
        {storyBeats.map((beat, index) => (
          <StoryText
            key={index}
            heading={beat.heading}
            subtext={beat.subtext}
            scrollYProgress={scrollYProgress}
            rangeStart={beat.rangeStart}
            rangeEnd={beat.rangeEnd}
          />
        ))}

        {/* Scroll indicator (visible at start) */}
        <ScrollIndicator scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}

function StoryText({
  heading,
  subtext,
  scrollYProgress,
  rangeStart,
  rangeEnd,
}: {
  heading: string;
  subtext: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  rangeStart: number;
  rangeEnd: number;
}) {
  const fadeIn = rangeStart;
  const peakStart = rangeStart + (rangeEnd - rangeStart) * 0.2;
  const peakEnd = rangeEnd - (rangeEnd - rangeStart) * 0.2;
  const fadeOut = rangeEnd;

  const opacity = useTransform(
    scrollYProgress,
    [fadeIn, peakStart, peakEnd, fadeOut],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [fadeIn, peakStart, peakEnd, fadeOut],
    [60, 0, 0, -40]
  );
  const scale = useTransform(
    scrollYProgress,
    [fadeIn, peakStart, peakEnd, fadeOut],
    [0.95, 1, 1, 0.98]
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      style={{ opacity, y, scale }}
    >
      <h2
        className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        style={{
          color: "#EEEFE0",
          fontFamily: "Inter, sans-serif",
          textShadow: "0 2px 40px rgba(15,21,19,0.8), 0 0 120px rgba(15,21,19,0.5)",
        }}
      >
        {heading}
      </h2>
      <p
        className="max-w-xl text-lg sm:text-xl md:text-2xl"
        style={{
          color: "#A7C1A8",
          fontFamily: "Inter, sans-serif",
          textShadow: "0 2px 20px rgba(15,21,19,0.9)",
        }}
      >
        {subtext}
      </p>
    </motion.div>
  );
}

function ScrollIndicator({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <motion.div
      className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      style={{ opacity }}
    >
      <p
        className="text-xs uppercase tracking-[0.3em]"
        style={{ color: "#819A91" }}
      >
        Scroll to explore
      </p>
      <div className="relative h-8 w-5 rounded-full border border-[#819A91]/40">
        <motion.div
          className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: "#A7C1A8" }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
