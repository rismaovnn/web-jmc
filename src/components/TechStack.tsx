import { useState } from 'react';
import { Layers } from 'lucide-react';

export default function TechStack() {
  const [activeTech, setActiveTech] = useState<string | null>(null);

  const technologies = [
    { name: 'Three.js', role: 'Interactive WebGL', desc: 'Custom scene graph, shader chunks, and memory-managed geometry pipelines.' },
    { name: 'WebGPU / GLSL', role: 'Hardware Compute', desc: 'Direct GPU access for massive multi-million particle simulations.' },
    { name: 'Unreal Engine 5', role: 'Lumen & Nanite', desc: 'Pixel-streaming architectures and ultra-high fidelity digital twins.' },
    { name: 'Unity WebXR', role: 'Spatial Simulation', desc: 'Cross-device stereoscopic immersion with hand-tracking physics.' },
    { name: 'Next.js 14', role: 'Edge SSR Rendering', desc: 'Instant server-side initial paint with seamless hydration into 3D viewports.' },
    { name: 'Flutter', role: 'Cross-platform iOS/Android', desc: 'Unified high-performance mobile clients with native platform channels.' },
    { name: 'Blender 4.2', role: 'Parametric Asset Rigging', desc: 'Non-destructive 3D asset modeling, Draco quantization, and PBR baking.' },
    { name: 'Spline 3D', role: 'Vector 3D Web', desc: 'Interactive real-time 3D web illustrations and kinetic vector typography.' },
    { name: 'Docker & K8s', role: 'Microservice Scaling', desc: 'Zero-downtime containerized WebSocket cluster orchestration.' },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-100" id="tech-ecosystem">
      <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/20 text-[#01176b] font-mono text-xs font-bold uppercase tracking-wider mb-2 border border-yellow-400/50">
          <Layers className="w-3.5 h-3.5 text-yellow-500" />
          COMPUTATIONAL FOUNDATION
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 mb-8">
          Modern Tech Stack <span className="bg-gradient-to-r from-[#2281d8] to-[#01176b] bg-clip-text text-transparent">Ecosystem</span>
        </h2>

        <div className="flex flex-wrap justify-center items-center gap-3 max-w-4xl mx-auto">
          {technologies.map((tech) => {
            const isSelected = activeTech === tech.name;
            return (
              <div
                key={tech.name}
                onClick={() => setActiveTech(isSelected ? null : tech.name)}
                className={`group relative px-5 py-3 rounded-full transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-yellow-400 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-yellow-400/40 scale-105'
                    : 'bg-gradient-to-r from-[#01176b] to-[#114ca6] border border-yellow-400/40 text-white shadow-sm hover:border-yellow-400 hover:shadow-md'
                }`}
              >
                <span
                  className={`font-mono text-xs font-bold transition-colors ${
                    isSelected ? 'text-slate-950 font-black' : 'text-white group-hover:text-yellow-300'
                  }`}
                >
                  {tech.name}
                </span>

                {/* Hover Tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#01176b] border border-yellow-400 text-yellow-300 font-mono text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-20">
                  {tech.role}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Tech Detail Drawer - Blue & Yellow Card */}
        {activeTech && (
          <div className="mt-8 max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-[#114ca6] via-[#0b37a5] to-[#01176b] border-2 border-yellow-400/45 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-left text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
              <span className="font-mono text-sm font-extrabold text-yellow-300">
                {technologies.find((t) => t.name === activeTech)?.name}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-semibold">
                {technologies.find((t) => t.name === activeTech)?.role}
              </span>
            </div>
            <p className="mt-3 text-xs text-blue-100 leading-relaxed font-body">
              {technologies.find((t) => t.name === activeTech)?.desc}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

