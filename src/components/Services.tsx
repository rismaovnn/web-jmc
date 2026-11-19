import { ArrowUpRight, Box, Globe2, Eye, CodeXml, Clapperboard, Blocks } from 'lucide-react';
import { Link } from 'react-router-dom';

const capabilities = [
  { icon: Box, title: '3D Spatial Environments', description: 'Immersive 3D environments for spatial visualization, virtual exploration, and interactive simulations.', tags: ['3D Environment', 'WebGL', 'Interactive 3D'] },
  { icon: Globe2, title: 'Metaverse & Virtual Worlds', description: 'Collaborative virtual worlds that connect people through shared digital experiences.', tags: ['Virtual Worlds', 'Multiplayer', 'Spatial Experience'] },
  { icon: Eye, title: 'XR & Interactive Learning', description: 'Engaging educational experiences powered by virtual worlds and immersive technologies.', tags: ['XR', 'Gamified Learning', 'Education'] },
  { icon: CodeXml, title: 'Interactive Web & Apps', description: 'Modern websites and applications combining intuitive interactions with user-centered design.', tags: ['Web App', 'Creative Tech', 'UI/UX'] },
  { icon: Clapperboard, title: 'Creative Digital Experiences', description: 'Brand experiences and digital storytelling that create meaningful audience engagement.', tags: ['Digital Experience', 'Storytelling', 'Creative'] },
  { icon: Blocks, title: 'Virtual Tours & Simulations', description: '360° virtual tours and digital simulations that bring destinations to audiences everywhere.', tags: ['360° Tour', 'Simulation', 'Virtual Visit'] },
];

export default function Services({ featured = false }: { featured?: boolean }) {
  const items = featured ? capabilities.slice(0, 3) : capabilities;
  return <section id={featured?'services':'all-services'} className="jmc-section jmc-section-light jmc-top-border">
    <div className="jmc-wrap">
      <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="jmc-eyebrow">What We Do</span>
          <h2 className="jmc-title">Our <span className="jmc-title-gradient">Services.</span></h2>
          <p className="jmc-description mt-4">Creative technology capabilities designed to deliver immersive, relevant, and memorable digital experiences.</p>
        </div>
        {featured && <Link to="/product" className="jmc-section-link inline-flex shrink-0 items-center gap-2 text-sm font-semibold transition-colors">Explore All Services <ArrowUpRight size={16}/></Link>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(({icon: Icon, title, description, tags},idx)=><article key={title} className="jmc-card jmc-hover flex min-h-[313px] flex-col justify-between p-7 md:p-8 group">
          <div>
            <div className="flex justify-between items-start">
              <span className="grid place-items-center w-13 h-13 rounded-2xl bg-[#ffd226] text-[#08142b] shadow-[0_6px_20px_rgba(255,206,45,.18)] group-hover:scale-105 transition-transform duration-300"><Icon size={26} strokeWidth={2.15}/></span>
              <span className="text-[11px] font-mono text-blue-300/45">0{idx+1}</span>
            </div>
            <h3 className="mt-7 text-xl font-extrabold tracking-tight text-white">{title}</h3>
            <p className="mt-3 text-[13px] leading-[1.85] text-[#a4bce0]">{description}</p>
          </div>
          <div className="mt-7 border-t border-sky-200/12 pt-4 flex flex-wrap gap-2">{tags.map(tag=><span key={tag} className="jmc-badge">{tag}</span>)}</div>
        </article>)}
      </div>
    </div>
  </section>;
}
