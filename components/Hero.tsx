"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createScene, STAGES } from "@/lib/scene";

const HERO_COPY = [
  {
    t: "Mulai dari air yang tenang.",
    p: "Akuarium kaca low-iron 60 sampai 90 cm dengan sambungan silikon yang rapi.",
    cta: "Lihat akuarium",
  },
  {
    t: "Dasar yang memberi makan akar.",
    p: "Soil nutrisi, pasir silika, dan laterit untuk setiap jenis tata letak.",
    cta: "Belanja substrat",
  },
  {
    t: "Batu menentukan wataknya.",
    p: "Seiryu, dragon stone, dan batu Frodo. Dipilih dan difoto per potong.",
    cta: "Belanja batu dan kayu",
  },
  {
    t: "Kayu memberi umur.",
    p: "Spiderwood dan akar bakau yang sudah direbus, tanpa air cokelat.",
    cta: "Belanja batu dan kayu",
  },
  {
    t: "Lalu hijau mulai tumbuh.",
    p: "Stem, rosette, karpet, dan lumut. Dikirim basah dan bebas siput.",
    cta: "Belanja tanaman",
  },
  {
    t: "Terakhir, penghuninya.",
    p: "Ikan dan udang tangkar lokal, dikarantina 14 hari sebelum dijual.",
    cta: "Belanja ikan dan udang",
  },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Akuarium yang tersusun mengikuti scroll (canvas). */
export function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current!;
    const rail = railRef.current!;
    const scene = createScene(canvasRef.current!);
    const reduced = prefersReduced();
    let target = 0;
    let current = 0;
    let raf = 0;
    let visible = true;
    let last = -1;

    const measure = () => {
      const r = track.getBoundingClientRect();
      const scrollable = r.height - innerHeight;
      target = scrollable > 0 ? clamp(-r.top / scrollable) : 0;
      visible = r.bottom > 0 && r.top < innerHeight;
      document.body.dataset.hero = r.top <= 8 && r.bottom > 80 ? "on" : "off";
    };

    const frame = (ms: number) => {
      measure();
      current = reduced ? target : current + (target - current) * 0.12;
      if (Math.abs(target - current) < 0.0005) current = target;
      if (visible) {
        scene.draw(current, reduced ? 0 : ms / 1000);
        rail.style.transform = `scaleY(${current})`;
        let idx = 0;
        STAGES.forEach((s, i) => {
          if (current >= s.at - 0.0001) idx = i;
        });
        if (idx !== last) {
          last = idx;
          setActive(idx);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => scene.resize();
    addEventListener("resize", onResize);
    measure();
    current = target;
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      delete document.body.dataset.hero;
    };
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current!;
    const scrollable = track.offsetHeight - innerHeight;
    const top = track.getBoundingClientRect().top + scrollY;
    scrollTo({
      top: top + (STAGES[i].at + (i === 0 ? 0.001 : 0.01)) * scrollable,
      behavior: prefersReduced() ? "auto" : "smooth",
    });
  };

  return (
    <section className="hero" aria-label="Akuarium yang tersusun saat Anda menggulir">
      <div className="hero__track" ref={trackRef}>
        <div className="hero__stage">
          <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
          <div className="hero__copy">
            {HERO_COPY.map((c, i) => {
              const on = i === active;
              return (
                <div key={i} className={`chapter ${on ? "is-on" : ""}`} inert={!on} aria-hidden={!on}>
                  {i === 0 ? <h1 className="chapter__t">{c.t}</h1> : <h2 className="chapter__t">{c.t}</h2>}
                  <p className="chapter__p">{c.p}</p>
                  <Link className="btn btn--light" href={STAGES[i].href}>
                    {c.cta}
                  </Link>
                </div>
              );
            })}
          </div>
          <ol className="steps" aria-label="Tahap menyusun akuarium">
            {STAGES.map((s, i) => (
              <li key={s.key}>
                <button
                  type="button"
                  className={[i === active && "is-on", i < active && "is-done"].filter(Boolean).join(" ")}
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => goTo(i)}
                >
                  <span className="steps__n">{i + 1}</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
          <p className="hero__hint">Gulir untuk menyusunnya</p>
          <Link className="hero__skip" href="/toko">
            Lewati, langsung belanja
          </Link>
          <div className="hero__rail" aria-hidden="true">
            <i ref={railRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
