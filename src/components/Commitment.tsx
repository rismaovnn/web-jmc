import { motion } from 'motion/react';
import { Globe, GraduationCap, Building2, Leaf } from 'lucide-react';

const cards = [
  {
    icon: Globe,
    title: 'Solusi Digital',
    description: 'Menyediakan solusi digital berbasis metaverse yang bermanfaat bagi masyarakat luas.',
  },
  {
    icon: GraduationCap,
    title: 'Pendidikan Tanpa Batas',
    description: 'Membantu dunia pendidikan menghadirkan ruang belajar interaktif tanpa batas geografis.',
  },
  {
    icon: Building2,
    title: 'Bisnis & Layanan Publik',
    description: 'Mendukung perusahaan dan instansi pemerintah dalam rapat, pelatihan, dan pameran virtual.',
  },
  {
    icon: Leaf,
    title: 'Komitmen Berkelanjutan',
    description:
      'Memberikan kontribusi nyata bagi efisiensi bisnis, akses pendidikan, serta pengurangan jejak karbon melalui teknologi virtual.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function Commitment() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 md:px-8 bg-white" id="commitment">
      {/* Header row: badge + heading (left) / paragraph (right) */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-3">
            Tujuan &amp; Komitmen JuaraMetaCorp
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
            Tujuan &amp;{' '}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#38BDF8] bg-clip-text text-transparent">
              Komitmen
            </span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="text-base sm:text-lg text-slate-600 font-body leading-relaxed md:pt-2"
        >
          JuaraMetaCorp berkomitmen menghadirkan solusi digital inovatif melalui teknologi metaverse,
          virtual environment, dan pengalaman digital interaktif. Kami membantu institusi pendidikan,
          perusahaan, UMKM, hingga pemerintahan membangun ekosistem digital yang kolaboratif, efisien,
          dan berkelanjutan.
        </motion.p>
      </div>

      {/* 4-column card grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group p-6 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)] hover:bg-white transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB] mb-4 transition-transform duration-300 group-hover:rotate-6">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-sans text-base font-bold text-slate-900 mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-slate-600 font-body leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
