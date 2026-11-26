"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { assemblyAt, STAGES } from "@/lib/aquarium/assembly";
import { createScene } from "@/lib/scene";
import "@/app/styles/aquarium.css";

const HERO_COPY = [
  {
    title: "Sungai kecil",
    accent: "di balik kaca.",
    text: "Mulai dari tangki kaca kosong. Gulir untuk mengisi air, menata dasar akuarium, lalu menghadirkan kawanan neon tetra.",
    cta: "Lihat akuarium",
  },
  {
    title: "Alur pasir",
    accent: "di dasar air.",
    text: "Pasir terang membentuk alur di dasar akuarium. Di kedua sisinya, lapisan soil menyediakan tempat bagi akar tanaman.",
    cta: "Belanja substrat",
  },
  {
    title: "Watak batu",
    accent: "sungai.",
    text: "Batu utama berdiri miring. Pecahan yang lebih kecil mengikuti arah seratnya dan membentuk tepian alur pasir.",
    cta: "Belanja batu dan kayu",
  },
  {
    title: "Lengkung",
    accent: "kayu tua.",
    text: "Cabang spiderwood membentang di atas batu. Di bawahnya, ikan mendapat celah teduh untuk melintas.",
    cta: "Belanja batu dan kayu",
  },
  {
    title: "Hijau yang",
    accent: "mengalir.",
    text: "Rumpun daun tinggi bergerak pelan mengikuti arus, sementara tanaman karpet merambat di dekat dasar.",
    cta: "Belanja tanaman",
  },
  {
    title: "Sekawanan",
    accent: "neon tetra.",
    text: "Garis biru pada sisi tubuh tetra menangkap cahaya saat kawanan berbelok di antara tanaman.",
    cta: "Belanja ikan dan udang",
  },
];

function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      className={down ? "aquascape__down" : undefined}
    >
      <path
        d="M3 10h13m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const motionPreference = "(prefers-reduced-motion: reduce)";
const postersByStage = ["kosong", "air", "substrat", "batu", "kayu", "tanaman", "ondine"];

export function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const postersRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const pausedRef = useRef(false);
  const requestDraw = useRef<(() => void) | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const posters = Array.from(postersRef.current!.children) as HTMLElement[];
    const rail = railRef.current!;
    const preference = window.matchMedia(motionPreference);
    let scene: ReturnType<typeof createScene> = null;
    let initialized = false;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let trackTop = 0;
    let trackHeight = 0;
    let scrollRange = 1;
    let onscreen = false;
    let target = 0;
    let progress = 0;
    let displayed = -1;
    let chapterIndex = 0;
    let layers = assemblyAt(0);
    const posterLoads = new Map<number, HTMLImageElement>();
    const readyPosters = new Set([0]);

    function stopFrame() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }

    function schedule() {
      if (!frame && onscreen && !document.hidden) frame = requestAnimationFrame(render);
    }

    function loadPoster(index: number) {
      if (readyPosters.has(index) || posterLoads.has(index)) return;
      const image = new Image();
      posterLoads.set(index, image);
      image.onload = () => {
        posters[index].style.backgroundImage = `url("${image.src}")`;
        readyPosters.add(index);
        schedule();
      };
      image.src = `/images/akuarium-${postersByStage[index]}.webp`;
    }

    function drawPosters() {
      const nextLayer = layers.findIndex((value) => value < 1);
      const low = nextLayer < 0 ? layers.length : nextLayer;
      const high = Math.min(low + 1, layers.length);
      loadPoster(low);
      loadPoster(high);
      // Keep the last available earlier stage visible while the next image is loading.
      let base = low;
      while (!readyPosters.has(base)) base--;
      const mix = high !== low && readyPosters.has(high) ? layers[low] : 0;
      for (let i = 0; i < posters.length; i++) {
        posters[i].style.opacity = String(i === base ? 1 - mix : i === high ? mix : 0);
      }
    }

    function render(now: number) {
      frame = 0;
      if (!onscreen || document.hidden) return;

      if (!initialized) {
        initialized = true;
        scene = createScene(canvas);
        scene?.resize();
      }

      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.08) : 1 / 60;
      lastTime = now;
      const playing = !preference.matches && !pausedRef.current;
      if (preference.matches || Math.abs(target - progress) < 0.0001) {
        progress = target;
      } else {
        progress += (target - progress) * (1 - Math.exp(-delta * 13));
      }

      if (displayed !== progress) {
        layers = assemblyAt(progress);
        rail.style.transform = `scaleX(${progress})`;
        const index = STAGES.reduce((selected, step, i) => (progress >= step.at ? i : selected), 0);
        if (index !== chapterIndex) {
          chapterIndex = index;
          setActive(index);
        }
        displayed = progress;
      }
      const moving = scene && playing && layers[0] > 0;
      if (moving) elapsed += delta;
      if (scene) {
        scene.draw(progress, elapsed);
        if (!stage.dataset.live) stage.dataset.live = "true";
      } else drawPosters();

      if (moving || target !== progress) schedule();
      else lastTime = 0;
    }

    function onScroll() {
      const offset = window.scrollY - trackTop;
      target = Math.min(1, Math.max(0, offset / scrollRange));
      onscreen = offset < trackHeight && offset > -window.innerHeight;
      const headerMode = offset >= -8 && offset < trackHeight - 80 ? "on" : "off";
      if (document.body.dataset.hero !== headerMode) document.body.dataset.hero = headerMode;
      if (onscreen) schedule();
      else {
        stopFrame();
        progress = target;
      }
    }

    function onResize() {
      trackTop = track.getBoundingClientRect().top + window.scrollY;
      trackHeight = track.offsetHeight;
      scrollRange = Math.max(1, trackHeight - stage.offsetHeight);
      scene?.resize();
      onScroll();
    }

    function onVisibility() {
      if (document.hidden) stopFrame();
      else onScroll();
    }

    function onContextLost(event: Event) {
      event.preventDefault();
      delete stage.dataset.live;
      scene?.dispose();
      scene = null;
      initialized = true;
      schedule();
    }

    function onContextRestored() {
      initialized = false;
      schedule();
    }

    requestDraw.current = schedule;
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", schedule);
    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);
    onResize();
    progress = target;

    return () => {
      stopFrame();
      for (const image of posterLoads.values()) image.onload = null;
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", schedule);
      requestDraw.current = null;
      scene?.dispose();
      delete stage.dataset.live;
      delete document.body.dataset.hero;
    };
  }, []);

  function togglePlayback() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    requestDraw.current?.();
  }

  function goTo(index: number) {
    const track = trackRef.current!;
    const range = track.offsetHeight - stageRef.current!.offsetHeight;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + Math.ceil(STAGES[index].viewAt * range),
      behavior: window.matchMedia(motionPreference).matches ? "instant" : "smooth",
    });
  }

  return (
    <section className="hero aquascape" aria-label="Rangkai akuarium Ondine">
      <div className="hero__track" ref={trackRef}>
        <div className="hero__stage" ref={stageRef}>
          <div
            className="aquascape__view"
            role="img"
            aria-label="Tangki kaca kosong yang terisi air, substrat, batu, kayu, tanaman, dan ikan saat halaman digulir."
          >
            <div ref={postersRef} className="aquascape__posters" aria-hidden="true">
              {postersByStage.map((name) => (
                <span key={name} />
              ))}
            </div>
            <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
          </div>
          <div className="hero__copy">
            {HERO_COPY.map((chapter, i) => {
              const on = i === active;
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <div
                  key={STAGES[i].key}
                  className={`chapter ${on ? "is-on" : ""}`}
                  inert={!on}
                  aria-hidden={!on}
                >
                  <Heading className="chapter__t">
                    {chapter.title} <em>{chapter.accent}</em>
                  </Heading>
                  <p className="chapter__p">{chapter.text}</p>
                  <Link className="btn btn--light" href={STAGES[i].href}>
                    {chapter.cta} <Arrow />
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="aquascape__footer">
            <div className="aquascape__tools">
              <p className="hero__hint">
                <Arrow down /> Gulir untuk merakit
              </p>
              <div className="aquascape__actions">
                <button
                  className="aquascape__playback"
                  type="button"
                  aria-label={paused ? "Putar animasi akuarium" : "Jeda animasi akuarium"}
                  title={paused ? "Putar animasi" : "Jeda animasi"}
                  onClick={togglePlayback}
                >
                  <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" aria-hidden="true">
                    {paused ? <path d="m6 3.5 10 6.5-10 6.5z" /> : <path d="M5 4h3v12H5zm7 0h3v12h-3z" />}
                  </svg>
                </button>
                <Link className="hero__skip" href="/toko">
                  Langsung ke toko <Arrow />
                </Link>
              </div>
            </div>
            <nav aria-label="Tahap merakit akuarium">
              <div className="hero__rail" aria-hidden="true">
                <i ref={railRef} />
              </div>
              <ol className="steps">
                {STAGES.map((step, i) => (
                  <li key={step.key}>
                    <button
                      type="button"
                      aria-current={i === active ? "step" : undefined}
                      onClick={() => goTo(i)}
                    >
                      <span className="steps__n" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {step.label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
