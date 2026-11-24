import { createScene, STAGES } from "./scene";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* Memasang hero scroll. Mengembalikan fungsi pembersih untuk dipanggil saat pindah halaman. */
export function mountHero(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>("#heroTrack")!;
  const canvas = root.querySelector<HTMLCanvasElement>("#heroCanvas")!;
  const chapters = [...root.querySelectorAll<HTMLElement>(".chapter")];
  const steps = [...root.querySelectorAll<HTMLButtonElement>(".steps button")];
  const rail = root.querySelector<HTMLElement>("#heroRail")!;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = createScene(canvas);

  let target = 0, current = 0, active = -1, raf = 0, visible = true;

  const measure = () => {
    const r = track.getBoundingClientRect();
    const scrollable = r.height - innerHeight;
    target = scrollable > 0 ? clamp(-r.top / scrollable) : 0;
    visible = r.bottom > 0 && r.top < innerHeight;
    document.body.dataset.hero = r.top <= 8 && r.bottom > 80 ? "on" : "off";
  };

  const setActive = (p: number) => {
    let idx = 0;
    STAGES.forEach((s, i) => { if (p >= s.at - 0.0001) idx = i; });
    if (idx === active) return;
    active = idx;
    chapters.forEach((c, i) => {
      c.classList.toggle("is-on", i === idx);
      c.toggleAttribute("inert", i !== idx);
      c.setAttribute("aria-hidden", String(i !== idx));
    });
    steps.forEach((b, i) => {
      b.classList.toggle("is-on", i === idx);
      b.classList.toggle("is-done", i < idx);
      b.setAttribute("aria-current", i === idx ? "step" : "false");
    });
  };

  const frame = (ms: number) => {
    measure();
    current = reduced ? target : current + (target - current) * 0.12;
    if (Math.abs(target - current) < 0.0005) current = target;
    if (visible) {
      scene.draw(current, reduced ? 0 : ms / 1000);
      rail.style.transform = `scaleY(${current})`;
      setActive(current);
    }
    raf = requestAnimationFrame(frame);
  };

  const onResize = () => scene.resize();
  addEventListener("resize", onResize);

  const onStep = (i: number) => {
    const scrollable = track.offsetHeight - innerHeight;
    const top = track.getBoundingClientRect().top + scrollY;
    const at = STAGES[i].at;
    scrollTo({ top: top + (at + (i === 0 ? 0.001 : 0.01)) * scrollable, behavior: reduced ? "auto" : "smooth" });
  };
  const handlers = steps.map((b, i) => {
    const h = () => onStep(i);
    b.addEventListener("click", h);
    return h;
  });

  measure();
  current = target;
  setActive(current);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("resize", onResize);
    steps.forEach((b, i) => b.removeEventListener("click", handlers[i]));
    delete document.body.dataset.hero;
  };
}
