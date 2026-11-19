import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface PageHeroProps {
  badge: string;
  title: ReactNode;
  description: string;
}

/**
 * Animated intro banner for interior pages, with staggered copy and an ambient
 * background glow. Motion respects the user's reduced-motion preference.
 */
export default function PageHero({ badge, title, description }: PageHeroProps) {
  const reduced = useReducedMotion();
  const entrance = (step: number) => ({
    initial: reduced ? false as const : { opacity: 0, y: 30, filter: 'blur(7px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: reduced ? 0 : 0.72, delay: reduced ? 0 : step * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <section className="relative isolate overflow-hidden bg-[#030b26] text-white pt-36 pb-20 md:pt-44 md:pb-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_70%_0%,#0b2a7a_0%,#061650_35%,#030b26_75%)]" />
      <div className="jmc-page-hero-glow absolute -top-32 right-[-8%] -z-10 w-[460px] h-[460px] rounded-full bg-blue-400/15 blur-[110px] pointer-events-none" />
      <div className="absolute inset-0 -z-10 opacity-[0.15] bg-[radial-gradient(rgba(148,197,255,0.35)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

      <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
        <motion.span {...entrance(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-[11px] sm:text-xs font-semibold text-cyan-100 tracking-[0.18em] uppercase">
          {badge}
        </motion.span>
        <motion.h1 {...entrance(1)} className="mt-6 font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] leading-[1.02]">
          {title}
        </motion.h1>
        <motion.p {...entrance(2)} className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-blue-100/75 font-body leading-relaxed">
          {description}
        </motion.p>
      </div>
    </section>
  );
}
