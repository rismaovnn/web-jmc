import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../cms/ContentContext';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, Sparkles, Radio, ChevronDown } from 'lucide-react';
import ThreeCanvas from './ThreeCanvas';
import HeroEcosystem from './HeroEcosystem';

interface HeroProps {
  onStartProject: () => void;
  onExploreProducts: () => void;
}

// blur + rise reveal used by every hero line, staggered by index (plays once on load)
const reveal = (i: number) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
});

const stats = [
  { value: '360°', label: 'Virtual Tours' },
  { value: '3D', label: 'Virtual Worlds' },
  { value: 'XR', label: 'Interactive Learning' },
];

export default function Hero({ onStartProject, onExploreProducts }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { hero } = useContent();
  const navigate = useNavigate();
  function openLink(href: string, fallback: () => void) {
    if (!href) {fallback();return;}
    if (href.startsWith('/') && !href.startsWith('//')) {navigate(href);return;}
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  // scroll-linked fade/parallax while leaving the hero (driven by the user's scrolling only)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  // pointer tilt for the floating technology cards — only while the cursor is over the illustration
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const cardsX = useSpring(px, { stiffness: 60, damping: 18 });
  const cardsY = useSpring(py, { stiffness: 60, damping: 18 });
  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * -18);
    py.set(((e.clientY - r.top) / r.height - 0.5) * -14);
  };
  const handlePointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative isolate overflow-hidden bg-[#030b26] text-white min-h-[100svh] flex items-center pt-28 pb-16 lg:pt-24 lg:pb-24"
    >
      {/* ------------------------------------------------ background layers (static) */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
        {/* deep navy base with blue light from above */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_0%,#0b2a7a_0%,#061650_35%,#030b26_70%)]" />
        {/* aurora glows (static) */}
        <div className="jmc-aurora jmc-aurora-a absolute -top-40 right-[-10%] w-[720px] h-[720px] rounded-full bg-[#2563eb]/35 blur-[140px]" />
        <div className="jmc-aurora jmc-aurora-b absolute top-[30%] right-[18%] w-[460px] h-[460px] rounded-full bg-[#22d3ee]/20 blur-[120px]" />
        <div className="jmc-aurora jmc-aurora-c absolute bottom-[-20%] left-[-10%] w-[620px] h-[520px] rounded-full bg-[#7c3aed]/20 blur-[150px]" />
        {/* perspective neon grid floor (static) */}
        <motion.div style={{ y: gridY }} className="absolute inset-x-[-20%] bottom-0 h-[55%] hero-grid-wrap">
          <div className="hero-grid" />
        </motion.div>
        {/* fine dotted texture */}
        <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(rgba(148,197,255,0.35)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        {/* clean edge into the white page below: dark fade + a thin glowing horizon line */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#030b26]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-60px] w-[70%] h-[120px] rounded-[100%] bg-[#22d3ee]/25 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[1320px] mx-auto px-5 md:px-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-6 items-center">
        {/* ------------------------------------------------ left: copy */}
        <motion.div style={{ y: contentY, opacity: fade }} className="text-center lg:text-left relative z-10">
          <motion.div
            {...reveal(0)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-cyan-100 tracking-[0.18em] uppercase shadow-[0_0_24px_rgba(34,211,238,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            {hero.eyebrow}
          </motion.div>

          <motion.h1
            {...reveal(1)}
            className="mt-6 font-sans text-[44px] leading-[0.95] sm:text-7xl lg:text-[84px] font-extrabold tracking-[-0.035em]"
          >
            <span className="bg-gradient-to-b from-white via-white to-blue-200/80 bg-clip-text text-transparent">
              {hero.headline}
            </span>
          </motion.h1>

          <motion.p
            {...reveal(2)}
            className="mt-4 text-[22px] sm:text-3xl lg:text-[36px] font-bold leading-[1.15] tracking-tight"
          >
            <span className="text-white/90">Building </span>
            <span className="bg-gradient-to-r from-[#67e8f9] via-[#60a5fa] to-[#a78bfa] bg-clip-text text-transparent">
              {hero.tagline}
            </span>
          </motion.p>

          <motion.p
            {...reveal(3)}
            className="mt-5 max-w-[520px] mx-auto lg:mx-0 text-base sm:text-lg text-blue-100/75 font-body leading-relaxed"
          >
            {hero.description}
          </motion.p>

          <motion.div {...reveal(4)} className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-3.5">
            <button
              onClick={() => openLink(hero.primaryHref, onStartProject)}
              className="group relative px-6 sm:px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#0ea5e9] text-white font-semibold text-sm shadow-[0_10px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_12px_40px_rgba(34,211,238,0.55)] hover:scale-[1.03] active:scale-[0.99] transition-all duration-300 flex items-center gap-2 cursor-pointer overflow-hidden"
            >
              {/* light sheen that sweeps across only on hover */}
              <span className="hero-btn-sheen absolute inset-0" aria-hidden="true" />
              <span className="relative">{hero.primaryLabel}</span>
              <ArrowUpRight className="relative w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={() => hero.secondaryHref === '/product' ? onExploreProducts() : openLink(hero.secondaryHref, onExploreProducts)}
              className="px-6 sm:px-7 py-3.5 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-md text-white/90 font-semibold text-sm hover:border-cyan-300/60 hover:bg-white/[0.09] hover:text-white hover:shadow-[0_0_24px_rgba(34,211,238,0.25)] transition-all duration-300 cursor-pointer"
            >
              {hero.secondaryLabel}
            </button>
          </motion.div>

          <motion.dl
            {...reveal(5)}
            className="mt-9 grid grid-cols-3 max-w-[420px] mx-auto lg:mx-0 gap-x-4 sm:flex sm:max-w-none sm:gap-x-8"
          >
            {stats.map((s, i) => (
              <div key={s.label} className={`flex flex-col ${i > 0 ? 'pl-4 border-l border-white/10 sm:pl-8' : ''}`}>
                <dt className="order-2 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.16em] text-blue-200/60 mt-1 leading-snug">{s.label}</dt>
                <dd className="order-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">{s.value}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ------------------------------------------------ right: metaverse core visual */}
        <motion.div
          style={{ y: visualY }}
          initial={{ opacity: 0, scale: 0.94, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative mx-auto w-full max-w-[560px] lg:max-w-[640px]"
        >
          <div className="relative w-full aspect-[1/1.02] sm:aspect-square">
            {/* glow behind the core */}
            <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.28),rgba(37,99,235,0.12)_45%,transparent_70%)] blur-2xl" />
            {hero.image ? <img src={hero.image} alt="JuaraMetaCorp hero visual" className="absolute inset-[8%] w-[84%] h-[84%] rounded-[30px] object-cover shadow-[0_0_80px_rgba(10,150,250,.25)]" /> : <><ThreeCanvas /><HeroEcosystem offsetX={cardsX} offsetY={cardsY} /></>}

            {/* status chip (static) */}
            <div className="absolute top-[3%] left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-full bg-[#071533]/60 backdrop-blur-md border border-cyan-300/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <span className="relative flex w-2 h-2">
                <span className="relative w-2 h-2 rounded-full bg-cyan-300" />
              </span>
              <Radio className="w-3 h-3 text-cyan-300" />
              <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-cyan-100/90">METAVERSE ECOSYSTEM</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* scroll cue: static, jumps to the highlight section below */}
      <motion.button
        onClick={() => document.getElementById('highlights')?.scrollIntoView({ behavior: 'smooth' })}
        style={{ opacity: fade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="jmc-scroll-cue hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-blue-200/60 hover:text-cyan-200 transition-colors cursor-pointer"
        aria-label="Scroll to highlights"
      >
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    </section>
  );
}
