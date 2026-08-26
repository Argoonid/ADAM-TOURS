import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Scene {
  src: string;
  eyebrow: string;
  title: string;
  highlight: string;
  text: string;
  hasCta?: boolean;
}

const SCENES: Scene[] = [
  {
    src: '/hero/1.webp',
    eyebrow: 'РЕЙС SSH · 27.9158° N 34.3300° E',
    title: 'Sharm & Adam Tours: ',
    highlight: 'ваш путь к приключениям',
    text: 'От первого шага на трапе самолёта до последнего заката над морем — мы собираем маршруты, которые запоминаются.'
  },
  {
    src: '/hero/2.webp',
    eyebrow: 'ГИЗА · ДРЕВНИЙ ЕГИПЕТ',
    title: 'Величие ',
    highlight: 'древних пирамид',
    text: 'Экскурсии с лицензированным египтологом — к плато Гиза, Сфинксу и залам Каирского музея без очередей и спешки.'
  },
  {
    src: '/hero/3.webp',
    eyebrow: 'ПУСТЫНЯ · СИНАЙ',
    title: 'Сафари в пустыне и ',
    highlight: 'драйв на квадроциклах',
    text: 'Джип-сафари по дюнам на закате, чай в бедуинской деревне и восточное шоу под звёздным небом.'
  },
  {
    src: '/hero/4.webp',
    eyebrow: 'КРАСНОЕ МОРЕ · ШАРМ-ЭЛЬ-ШЕЙХ',
    title: 'Роскошный отдых на ',
    highlight: 'побережье 5★',
    text: 'Круизы на белоснежных яхтах, погружение с аквалангом в чистейшие коралловые сады и отдых без компромиссов.',
    hasCta: true
  }
];

const FRAMES_PER_SCENE = 45;
const CROSSFADE_FRAMES = 10;
const TOTAL_FRAMES = SCENES.length * FRAMES_PER_SCENE;

const frames: { sceneIndex: number; t: number }[] = [];
for (let s = 0; s < SCENES.length; s++) {
  for (let i = 0; i < FRAMES_PER_SCENE; i++) {
    frames.push({
      sceneIndex: s,
      t: i / (FRAMES_PER_SCENE - 1)
    });
  }
}

export const ScrollytellingHero: React.FC<{ onBookClick?: () => void }> = ({ onBookClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flightFillRef = useRef<HTMLDivElement | null>(null);
  const flightPlaneRef = useRef<HTMLDivElement | null>(null);
  const chaptersRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const imagesMapRef = useRef<{ [key: string]: HTMLImageElement }>({});

  useEffect(() => {
    let loaded = 0;

    SCENES.forEach((scene) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        imagesMapRef.current[scene.src] = img;
        const pct = Math.round((loaded / SCENES.length) * 100);
        setLoadProgress(pct);
        if (loaded === SCENES.length) {
          setTimeout(() => setIsLoading(false), 150);
        }
      };
      img.onerror = () => {
        loaded++;
        imagesMapRef.current[scene.src] = img;
        setLoadProgress(Math.round((loaded / SCENES.length) * 100));
        if (loaded === SCENES.length) {
          setIsLoading(false);
        }
      };
      img.src = scene.src;
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawCover = (
      img: HTMLImageElement,
      alpha: number,
      zoomExtra: number,
      panExtra: number
    ) => {
      if (!img.complete || img.naturalWidth === 0) return;

      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const canvasRatio = cw / ch;
      const imgRatio = iw / ih;

      let drawW: number;
      let drawH: number;

      if (imgRatio > canvasRatio) {
        drawH = ch;
        drawW = ch * imgRatio;
      } else {
        drawW = cw;
        drawH = cw / imgRatio;
      }

      const zoom = 1 + zoomExtra;
      const zW = drawW * zoom;
      const zH = drawH * zoom;

      // Лёгкий панорамный сдвиг с сохранением фокуса на правой трети
      const offsetX = (cw - zW) / 2 + panExtra * 25;
      const offsetY = (ch - zH) / 2 - panExtra * 15;

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, offsetX, offsetY, zW, zH);
      ctx.globalAlpha = 1;
    };

    const renderFrame = (progress: number) => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = '#07111e';
      ctx.fillRect(0, 0, cw, ch);

      const idx = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
      );
      const frame = frames[idx];
      const scene = SCENES[frame.sceneIndex];
      const img = imagesMapRef.current[scene.src];
      if (!img) return;

      const zoomExtra = frame.t * 0.28;
      const panExtra = frame.t - 0.5;

      drawCover(img, 1, zoomExtra, panExtra);

      // Кроссфейд между сценами
      const framesLeftInScene = FRAMES_PER_SCENE - 1 - (idx % FRAMES_PER_SCENE);
      const isLastScene = frame.sceneIndex === SCENES.length - 1;
      if (!isLastScene && framesLeftInScene <= CROSSFADE_FRAMES) {
        const nextScene = SCENES[frame.sceneIndex + 1];
        const nextImg = imagesMapRef.current[nextScene.src];
        if (nextImg) {
          const fadeAlpha = 1 - framesLeftInScene / CROSSFADE_FRAMES;
          drawCover(nextImg, fadeAlpha, 0, -0.5);
        }
      }
    };

    const smoothstep = (edge0: number, edge1: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };

    const chapterRanges = [
      [0.0, 0.25],
      [0.25, 0.5],
      [0.5, 0.75],
      [0.75, 1.0]
    ];
    const FADE_ZONE = 0.05;

    const updateChapters = (progress: number) => {
      chapterRanges.forEach((range, i) => {
        const [start, end] = range;
        let opacity = 0;
        let ty = 24;

        if (progress >= start - FADE_ZONE && progress <= end + FADE_ZONE) {
          const fadeIn = smoothstep(start - FADE_ZONE, start + FADE_ZONE, progress);
          const fadeOut = 1 - smoothstep(end - FADE_ZONE, end + FADE_ZONE, progress);
          opacity = Math.min(fadeIn, fadeOut);
          ty = 24 * (1 - opacity);
        }

        const el = chaptersRef.current[i];
        if (el) {
          el.style.opacity = `${opacity}`;
          el.style.transform = `translateY(${ty}px)`;
          el.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
        }
      });
    };

    const updateFlightBar = (progress: number) => {
      const pct = progress * 100;
      if (flightFillRef.current) flightFillRef.current.style.width = `${pct}%`;
      if (flightPlaneRef.current) flightPlaneRef.current.style.left = `${pct}%`;
    };

    renderFrame(0);
    updateChapters(0);
    updateFlightBar(0);

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.15,
      onUpdate: (self) => {
        renderFrame(self.progress);
        updateChapters(self.progress);
        updateFlightBar(self.progress);
      }
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      trigger.kill();
    };
  }, [isLoading]);

  return (
    <>
      {/* ПРЕЛОАДЕР */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-[#07111e] flex items-center justify-center transition-opacity duration-300">
          <div className="text-center w-[min(90vw,380px)]">
            <div className="w-14 h-14 mx-auto mb-6 border border-[#d4af37] rounded-full flex items-center justify-center animate-spin">
              <Compass className="w-7 h-7 text-[#f5d77f]" />
            </div>
            <div className="text-xl font-bold text-white mb-1">
              Sharm <span className="text-[#d4af37]">&</span> Adam Tours
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#d4af37]/80 mb-5">
              Подготовка маршрута
            </div>
            <div className="w-full h-[2px] bg-white/10 relative mb-3 overflow-hidden rounded-full">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#d4af37] to-[#f5d77f] transition-all duration-200"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <div className="font-mono text-xs text-[#f5d77f]">{loadProgress}%</div>
          </div>
        </div>
      )}

      {/* ПРОГРЕСС-БАР ПОЛЁТА */}
      <div className="fixed top-0 left-0 right-0 z-[600] h-[2px] bg-white/10 pointer-events-none">
        <div
          ref={flightFillRef}
          className="h-full w-0 bg-gradient-to-r from-[#d4af37] to-[#f5d77f]"
        />
        <div
          ref={flightPlaneRef}
          className="absolute -top-2 left-0 -translate-x-1/2 rotate-90 text-xs text-[#f5d77f] drop-shadow-[0_0_6px_rgba(212,175,55,0.8)]"
        >
          ✈
        </div>
      </div>

      {/* SCROLL-STAGE */}
      <div ref={containerRef} className="relative h-[220vh] bg-[#07111e]">
        <div className="sticky top-0 left-0 w-screen h-screen overflow-hidden bg-[#07111e]">
          
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Боковое и фоновое затемнение под левый блок с текстом */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#07111e]/90 via-[#07111e]/40 to-transparent" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#07111e] via-transparent to-[#07111e]/60" />

          {/* Текстовые оверлеи в виде карточек */}
          <div className="absolute inset-0 flex items-center px-4 sm:px-10 md:px-20 pointer-events-none">
            {SCENES.map((scene, i) => (
              <div
                key={i}
                ref={(el) => {
                  chaptersRef.current[i] = el;
                }}
                className="absolute max-w-xl opacity-0 transition-transform duration-150 will-change-transform"
              >
                {/* Стеклянная плашка с золотым акцентом */}
                <div className="bg-[#07111e]/85 backdrop-blur-2xl p-6 sm:p-9 rounded-3xl border border-[#d4af37]/40 shadow-2xl shadow-black/90 space-y-4">
                  
                  <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#f5d77f] border border-[#d4af37]/40 px-3 py-1.5 rounded-full bg-[#040b14]/80 shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />
                    <span>{scene.eyebrow}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-[1.2]">
                    {scene.title}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#aa7c11]">
                      {scene.highlight}
                    </span>
                  </h2>

                  <p className="text-slate-200 text-xs sm:text-base leading-relaxed">
                    {scene.text}
                  </p>

                  {scene.hasCta && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onBookClick}
                        className="pointer-events-auto inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-[#07111e] font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl hover:shadow-[#d4af37]/30 hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <span>Забронировать тур</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Подсказка о скролле */}
          <div className="absolute left-1/2 bottom-8 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#d4af37] opacity-80 pointer-events-none">
            <span>Листайте вниз</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-[#d4af37] to-transparent animate-pulse" />
          </div>

        </div>
      </div>
    </>
  );
};