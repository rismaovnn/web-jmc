import { GraduationCap, Building2, Orbit } from 'lucide-react';
const highlights=[
  {icon:GraduationCap,title:'Education',desc:'Virtual campuses, interactive learning, and digital educational media.'},
  {icon:Building2,title:'Enterprise & Public Sector',desc:'Communication, visualization, and virtual experience solutions for organizations.'},
  {icon:Orbit,title:'Immersive Experiences',desc:'Connecting the physical and digital worlds through accessible technology.'},
];
export default function CompanyHighlight(){return <section id="highlights" className="jmc-section jmc-section-light jmc-top-border">
  <div className="jmc-wrap">
    <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-end"><div><span className="jmc-eyebrow">Who We Are</span><h2 className="jmc-title">Creative Technology <span className="jmc-title-gradient">for Real Impact.</span></h2></div><p className="jmc-description">We combine creativity and technology to help educational institutions, businesses, and organizations build meaningful digital experiences.</p></div>
    <div className="mt-12 grid md:grid-cols-3 gap-5">{highlights.map(({icon:Icon,title,desc})=><article key={title} className="jmc-card jmc-hover p-7"><div className="grid place-items-center w-11 h-11 rounded-xl border border-sky-300/20 bg-blue-500/15 text-sky-300"><Icon size={22}/></div><h3 className="mt-6 font-bold text-lg text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-[#a4b9dc]">{desc}</p></article>)}</div>
  </div>
</section>}
