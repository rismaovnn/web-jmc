import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, ExternalLink, Cpu, Layers, Sparkles } from 'lucide-react';

interface Project {
  id: string;
  category: 'spatial' | 'enterprise' | 'xr';
  badge: string;
  title: string;
  description: string;
  tech: string;
  image: string;
  detailedSpecs?: {
    scope: string;
    metrics: string;
    architecture: string;
    impact: string;
  };
}

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'spatial' | 'enterprise' | 'xr'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      id: 'nusantara',
      category: 'spatial',
      badge: 'DIGITAL TWIN • 3D GIS',
      title: 'Nusantara Metaverse Smart City',
      description: 'Macro-scale 3D digital twin platform for dynamic future urban governance and infrastructure telemetry.',
      tech: 'WebGL • Unreal Engine 5',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLGHOZKhx9CBA8k5kK7WyeyxehT9GVLKC_KlNdGHcUWpokojVsDYOBoDvtBzAlQGBnsN5wQdTNXoul2_jPNQRK0Q5igmytQJ6rYu_231CYBsbGksFVf9w-kzuLmwgqwE-3pzSJkHb_y2kMQvDZvxKozVSDOwf_3GAm7NMQ3HhvefX77PyKvUEJlss-7nEAlb-bNIVtS9TDKQhNXqlM4IS-O6r6K5A51gkJ8pkmSTtaKPSWnnlBZbaM5Q',
      detailedSpecs: {
        scope: '120 km² High-Definition Terrain Simulation with LOD Streaming',
        metrics: '60 FPS stable performance across Chromium & WebKit browsers',
        architecture: 'Decentralized GIS Tile Servers with WebSocket Sensor Streams',
        impact: 'Reduced simulated municipal energy allocation variance by 28%'
      }
    },
    {
      id: 'aerospatial',
      category: 'spatial',
      badge: 'AEROSPACE • REAL-TIME PBR',
      title: 'AeroSpatial 3D Cabin Configurator',
      description: 'High-precision browser WebGL visualization with physical materials & dynamic cabin lighting.',
      tech: 'Three.js • GLTF Draco',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYbsSoQ9F_Rtgf5gdTYp8bF66_Rekcef7ObVi4yBWkZ9N_NtKpSqORDRS5ESUQo9Zjr4ssQcEICXOM-E3Bi3jkWsMRP4LC7exlWuzWrQTrrJRYaA4SK3OLzHw0k1fw4XUPy5EmorbE1kgwQAF6-8zhOxwcN6KD75HhiQpUQUuOgG4Csj9OJBaVsVrNJng1h2VhL4yUQpaoSoGMMIeptneLNXgNrQ7z6DjP76qRalezMDaF2NxsyL9xNg',
      detailedSpecs: {
        scope: 'Full commercial aircraft fuselage interior with custom seating matrix',
        metrics: 'Initial asset footprint compressed to 1.8MB via Google Draco algorithms',
        architecture: 'Custom GLSL physically based shaders with real-time irradiance probes',
        impact: 'Elevated client VIP bespoke customization conversion by +64%'
      }
    },
    {
      id: 'eduverse',
      category: 'xr',
      badge: 'MEDTECH • WEBXR',
      title: 'EduVerse Medical Simulation XR',
      description: 'Holographic surgical training platform with real-time biometric feedback nodes and haptic sync.',
      tech: 'Unity WebXR • Cloud Spatial',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxrQE5aZA2kOaO_ypIHcufEpRPZL0yHEOkcP4VJvMvPVKTQERtMLtNbyL60G-9mDXqQr1FnOFVZ1l5FEBI3FfYLrSNrFqjmOwKKS_dIrDFhKqT755zeDzljKoVKn3cOQCCIdrSAnrAFfhv-RAZNJLyiBYTOpUx6i2whzu0OuQJqZn63UbicbhYyyW0sdoaYlAnGKJJsnDAoe6LEaRlTY_M0WCSCGpUBbVLLusWmWGau2iikqJMTZOnXw',
      detailedSpecs: {
        scope: 'Stereoscopic hand-tracked surgical theater simulator for clinical trainees',
        metrics: 'Sub-15ms motion-to-photon latency on standalone headsets & iPads',
        architecture: 'WebXR Device API + WebSockets cluster for proctor observation',
        impact: '4,000+ medical students trained with 40% retention increase'
      }
    },
    {
      id: 'fincore',
      category: 'enterprise',
      badge: 'FINTECH • HIGH CONVERSION',
      title: 'FinCore Global Banking Redesign',
      description: 'Mission-critical banking architecture on floating glass interfaces with millisecond telemetries.',
      tech: 'Next.js 14 • Tailwind',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATG5Zwi-IbtLNciHePyhgFiiEu3Kfb9zVMdgZY_3E6sUi0itmSPptUZN8NG7fRHjHhTFNRBhmNHYwzaAeG11lo6lN8FfCWTm87NAJfhC2pdcWbvMhFBdBk4Hx2V0LribLodUOBqkC_xNDcLHAS0cDb7X79Bdn5uh6y6KZqdoyNymh98BmXPhk6GT0Jr9fbu_rQzGXifhU6fj2U5fHqLX7jQNENRGhcT294RISXQax8ZT-6CTOLK7kVlw',
      detailedSpecs: {
        scope: 'Core wealth management dashboard spanning institutional portfolios',
        metrics: 'Perfect 100/100 Core Web Vitals score across global edge CDNs',
        architecture: 'Serverless Next.js edge runtime with zero client-side layout shift',
        impact: 'Processed $1.2B+ quarterly cross-border liquidity transactions'
      }
    },
    {
      id: 'veloce',
      category: 'spatial',
      badge: 'AUTOMOTIVE • SPLINE 3D',
      title: 'Veloce Hypercar 3D Launch Experience',
      description: 'Cinematic web showroom featuring aerodynamic wind tunnel airflow and bespoke shader customizer.',
      tech: 'WebGL • Raymarching Post-fx',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAc1vwHRjy99bWpvSnZw5TU8eL4mwAumQ8I4mjXSt78BZ1vJLAxnXlwaLXwDBbqjvE5oKCZHzZg3s1gRlVPm7apwX2XtH3LOJPwOzwM_xdrwDjP7GnXvIURZH_YZxLoWfJwjnzYWD8O8jCoAapVhALZD4DfvCtjFnVoFaWqLgX4zsLe7_7kPhVVXR9bCkslGy5dnIf7i-wBq5Qaxj_u4G2ZE0A1OI__szmE0ZBua7oQ76bQr5EF5-73w',
      detailedSpecs: {
        scope: 'Interactive digital showroom with realistic paint reflection & airflow physics',
        metrics: 'Loads in < 900ms worldwide via aggressive asset streaming',
        architecture: 'Custom compute shaders simulating Bernoulli fluid dynamics',
        impact: 'Full 100-vehicle collector allocation sold out within 48 hours'
      }
    },
    {
      id: 'aetheria',
      category: 'enterprise',
      badge: 'IDENTITY • 3D PACKAGING',
      title: 'Aetheria BioTech Sovereign Identity',
      description: 'High-end laboratory brand system with parametric 3D packaging and interactive design token guidelines.',
      tech: 'Design Tokens • 3D Assets',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC225AutM6Pv1Up1A2fWuqELiPfwVeTLTSyUoWyt1yCWB-DpU_OBtiMhXBfSW4jXKCnTtKNGn5bI_2-81q5ewukbnlkDVBSrTpMMQlh2BaWQNfBEDMmtXcFyWvNEHlmevrcnoPVn7OCbnky5X2NYmNFAl4ONYg-opZv1xQZBHWd8X9Om53Et0njT8ANih5Rt4VrtbaOFfsQgb4ZXhI1yzE17f0woStUa9R391Jq3_A5cRUs-RXa2RHCdw',
      detailedSpecs: {
        scope: 'Comprehensive brand identity across digital product & spatial industrial packaging',
        metrics: '400+ procedural tokenized design elements synchronized to GitHub',
        architecture: 'Figma Tokens API integrated directly into WebGL material pipelines',
        impact: 'Standardized global marketing across 18 regional distribution hubs'
      }
    }
  ];

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 md:px-8 bg-white" id="showcase">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/20 text-[#01176b] border border-yellow-400/50 font-mono text-xs font-bold uppercase tracking-wider mb-3">
            PORTFOLIO HIGHLIGHTS
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Crafted for <span className="bg-gradient-to-r from-[#2281d8] to-[#01176b] bg-clip-text text-transparent">Infinite Scale.</span>
          </h2>
          <p className="mt-2 text-slate-600 font-body text-base">
            Flagship spatial architectures deployed across enterprise, defense, and sovereign metaverse infrastructure.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl border border-slate-200 bg-slate-50 shadow-xs">
          {(['all', 'spatial', 'enterprise', 'xr'] as const).map((cat) => {
            const labelMap = {
              all: 'All Projects',
              spatial: 'Spatial & 3D',
              enterprise: 'Enterprise Apps',
              xr: 'XR Simulation',
            };
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-white text-[#01176b] hover:bg-yellow-400/20 border border-slate-200/80'
                }`}
              >
                {labelMap[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Cards Grid - Blue & Yellow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="tilt-card group rounded-3xl bg-gradient-to-b from-[#114ca6] via-[#0b37a5] to-[#01176b] border-2 border-yellow-400/35 hover:border-yellow-400 shadow-[0_12px_40px_rgba(1,23,107,0.25)] hover:shadow-[0_18px_50px_rgba(250,204,21,0.3)] overflow-hidden flex flex-col transition-all duration-300 cursor-pointer"
          >
            <div className="relative h-64 overflow-hidden bg-slate-900">
              <img
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                src={project.image}
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-mono text-[11px] font-extrabold shadow-md border border-yellow-500/40">
                {project.badge}
              </span>
            </div>

            <div className="p-7 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#0b37a5]/60 to-[#01176b]/95">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-blue-100/90 font-body line-clamp-2">
                  {project.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs font-mono text-blue-200">
                <span className="truncate pr-2 font-medium">{project.tech}</span>
                <span className="flex items-center gap-1 font-bold text-yellow-400 group-hover:text-yellow-300 group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 text-yellow-400" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-gradient-to-b from-[#114ca6] via-[#0b37a5] to-[#01176b] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-yellow-400/50 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-blue-100 hover:text-yellow-400 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider mb-4 shadow-md">
              {selectedProject.badge}
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {selectedProject.title}
            </h3>

            <div className="mt-4 rounded-2xl overflow-hidden h-60 bg-slate-900 border border-yellow-400/40">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="mt-4 text-blue-100 font-body text-base">
              {selectedProject.description}
            </p>

            {selectedProject.detailedSpecs && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#01176b]/80 border border-yellow-400/30">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-yellow-400 uppercase">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Operational Scope</span>
                  </div>
                  <p className="mt-1.5 text-sm text-blue-100 font-medium">
                    {selectedProject.detailedSpecs.scope}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#01176b]/80 border border-yellow-400/30">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-yellow-400 uppercase">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Computational Metrics</span>
                  </div>
                  <p className="mt-1.5 text-sm text-blue-100 font-medium">
                    {selectedProject.detailedSpecs.metrics}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#01176b]/80 border border-yellow-400/30 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-yellow-400 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>System Impact &amp; Results</span>
                  </div>
                  <p className="mt-1.5 text-sm text-blue-100 font-medium">
                    {selectedProject.detailedSpecs.impact}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-white/20 flex items-center justify-between">
              <span className="font-mono text-xs text-blue-200 font-semibold">
                {selectedProject.tech}
              </span>
              <Link
                to="/contact"
                onClick={() => setSelectedProject(null)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-xs font-extrabold hover:brightness-110 shadow-lg shadow-yellow-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Request Project Scope</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

