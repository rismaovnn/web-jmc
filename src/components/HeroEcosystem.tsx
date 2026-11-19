import { motion, type MotionValue } from 'motion/react';
import { Glasses, ScanFace, Box, Link2, Gem, Globe2 } from 'lucide-react';

/**
 * The six connected technologies around the hero portal: glass cards that float gently and are
 * linked to the portal core by flowing neon lines. Positions are percentages of the visual box,
 * so the layout scales with the 3D canvas behind it.
 */
const nodes = [
  { label: 'VR', caption: 'Virtual Reality', icon: Glasses, x: 17, y: 19, float: 5.2 },
  { label: 'AR', caption: 'Augmented Reality', icon: ScanFace, x: 9, y: 50, float: 6.1 },
  { label: '3D', caption: 'Real-time 3D', icon: Box, x: 15, y: 86, float: 5.6 },
  { label: 'Web3', caption: 'Decentralized Web', icon: Globe2, x: 83, y: 19, float: 5.8 },
  { label: 'Blockchain', caption: 'Trusted Ledger', icon: Link2, x: 90, y: 50, float: 6.4 },
  { label: 'NFT', caption: 'Digital Assets', icon: Gem, x: 85, y: 86, float: 5.4 },
];

// portal centre in the same percentage space (the 3D portal sits slightly above the middle)
const CORE = { x: 50, y: 45 };

interface HeroEcosystemProps {
  /** subtle parallax offset (px) driven by the pointer */
  offsetX?: MotionValue<number>;
  offsetY?: MotionValue<number>;
}

export default function HeroEcosystem({ offsetX, offsetY }: HeroEcosystemProps) {
  return (
    <motion.div className="absolute inset-0 pointer-events-none" style={{ x: offsetX, y: offsetY }}>
      {/* neon connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="eco-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {nodes.map((n) => (
          <g key={n.label}>
            <line
              x1={n.x}
              y1={n.y}
              x2={CORE.x}
              y2={CORE.y}
              stroke="#38bdf8"
              strokeOpacity="0.16"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={n.x}
              y1={n.y}
              x2={CORE.x}
              y2={CORE.y}
              stroke="url(#eco-line)"
              strokeWidth="1.6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>

      {/* technology cards */}
      {nodes.map((n, i) => {
        const Icon = n.icon;
        return (
          <motion.div
            key={n.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
          >
            <div>
              <div className="group pointer-events-auto flex items-center whitespace-nowrap gap-2 sm:gap-2.5 pl-1.5 pr-3 sm:pr-4 py-1.5 rounded-2xl bg-[#0a1a4a]/75 backdrop-blur-md border border-white/15 shadow-[0_8px_30px_rgba(2,8,30,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0d2260]/85 hover:border-cyan-300/50 hover:shadow-[0_10px_34px_rgba(34,211,238,0.35)] cursor-default">
                <span className="relative grid place-items-center w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#22d3ee] text-white shadow-[0_0_16px_rgba(34,211,238,0.45)]">
                  <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-sans text-[11px] sm:text-sm font-bold text-white tracking-tight">{n.label}</span>
                  <span className="hidden sm:block font-mono text-[9px] uppercase tracking-wider text-cyan-200/70 whitespace-nowrap">
                    {n.caption}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
