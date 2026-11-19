import { GraduationCap, Pickaxe, School, BookOpen } from 'lucide-react';

/** Client / partner strip. Static on purpose: the previous endless marquee animation was removed. */
export default function Marquee() {
  const partners = [
    { name: 'Universitas Teknokrat Indonesia', icon: GraduationCap },
    { name: 'PT Bukit Asam Tbk', icon: Pickaxe },
    { name: 'SMKN 4 Bandar Lampung', icon: School },
    { name: 'PGSD PGRI', icon: BookOpen },
  ];

  return (
    <section className="w-full py-14 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-[#01176b] font-extrabold bg-yellow-400/20 px-3.5 py-1.5 rounded-full border border-yellow-400/50">
          TRUSTED BY LEADERS ACROSS ENTERPRISE, GOVERNMENT &amp; TECH
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-4 sm:gap-5">
        {partners.map((partner) => {
          const Icon = partner.icon;
          return (
            <div
              key={partner.name}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#01176b] to-[#114ca6] border border-yellow-400/40 shadow-md hover:border-yellow-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center text-slate-950 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-sans text-sm font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                {partner.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
