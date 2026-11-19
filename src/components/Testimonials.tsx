import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        '“JuaraMetaCorp delivered our real-time 3D configurator with flawless 60 FPS mobile performance. Outstanding execution.”',
      author: 'Taufik Hidayat',
      role: 'Head of Innovation, Multinational Telco',
      initials: 'TH',
      avatarBg: 'bg-yellow-400 text-slate-950 font-bold',
    },
    {
      quote:
        '“Strict NDA compliance, sprint discipline, and software architecture that exceeded our executive board’s expectations.”',
      author: 'Rian Setiawan',
      role: 'Director of Digital Transformation, BUMN',
      initials: 'RS',
      avatarBg: 'bg-purple-600 text-white font-bold',
    },
    {
      quote:
        '“The WebXR educational simulator built by JuaraMetaCorp has successfully trained 4,000+ students with a 40% retention increase.”',
      author: 'Prof. Dr. Hendra',
      role: 'Dean of Engineering, Tier-1 University',
      initials: 'DH',
      avatarBg: 'bg-emerald-500 text-slate-950 font-bold',
    },
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 md:px-8 bg-white" id="testimonials">
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="font-mono text-xs uppercase tracking-widest text-[#01176b] font-extrabold bg-yellow-400/20 px-3.5 py-1.5 rounded-full border border-yellow-400/50 inline-block">
          CLIENT SIGNALS
        </span>
        <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
          Executive <span className="bg-gradient-to-r from-[#2281d8] to-[#01176b] bg-clip-text text-transparent">Validation.</span>
        </h2>
        <p className="mt-2 text-slate-600 text-sm font-body">
          Direct feedback from enterprise and technological leaders who transformed their digital capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div
            key={t.author}
            className="p-8 rounded-3xl bg-gradient-to-br from-[#114ca6] via-[#0b37a5] to-[#01176b] border-2 border-yellow-400/35 hover:border-yellow-400 shadow-[0_12px_40px_rgba(1,23,107,0.25)] hover:shadow-[0_18px_50px_rgba(250,204,21,0.25)] flex flex-col justify-between transition-all duration-300 group"
          >
            <div>
              <div className="flex text-yellow-400 gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-blue-100 font-body text-sm leading-relaxed">
                {t.quote}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/15 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full text-xs flex items-center justify-center shrink-0 shadow-md bg-yellow-400 text-slate-950 font-black"
              >
                {t.initials}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{t.author}</div>
                <div className="font-mono text-[10px] text-yellow-300 mt-0.5">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

