import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Images, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../cms/ContentContext';
import type { Product } from '../cms/schema';
const fallbackImages:Record<string,string>={
 'rumah-adat-lampung':'/images/projects/rumah-adat-lampung-concept.svg',
 'metaschool-smkn-4':'/images/projects/metaschool-concept.svg',
 'smk-al-kautsar':'/images/projects/future-concept.svg',
};
function Photo({project}:{project:Product}){
 const fallback=fallbackImages[project.id]||'/images/projects/future-concept.svg';
 const [src,setSrc]=useState(project.image||fallback);
 useEffect(()=>setSrc(project.image||fallback),[project.image,project.id,fallback]);
 return <img src={src} onError={()=>{if(src!==fallback)setSrc(fallback)}} alt={`Preview of ${project.title}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"/>;
}
export default function ProjectShowcase({showFuture=true}:{showFuture?:boolean}){
 const { products }=useContent();
 const [selected,setSelected]=useState<Product|null>(null);
 const ordered=[...products].sort((a,b)=>a.order-b.order);
 useEffect(()=>{if(!selected)return;const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')setSelected(null)};window.addEventListener('keydown',handler);const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{window.removeEventListener('keydown',handler);document.body.style.overflow=old}},[selected]);
 return <><section id="projects" className="jmc-section jmc-top-border relative"><div className="jmc-wrap">
  <div className="mb-13 max-w-3xl"><span className="jmc-eyebrow">Selected Projects</span><h2 className="jmc-title">Our <span className="jmc-title-gradient">Products.</span></h2><p className="jmc-description mt-4">Explore our work through actual projects and immersive experiences.</p></div>
  <div className="space-y-7">{ordered.map((project,index)=><article id={project.id} key={project.id} className="jmc-card jmc-card-white jmc-hover group p-3 sm:p-4 md:p-5 scroll-mt-28"><div className={`grid items-center gap-7 md:gap-11 lg:gap-15 md:grid-cols-2 ${index%2?'md:[&>*:first-child]:order-2':''}`}>
   <div className="jmc-project-visual relative aspect-video overflow-hidden rounded-[18px] border border-sky-200/20 bg-[#061631]"><Photo project={project}/><div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#03102a]/80 to-transparent pointer-events-none"/><div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-300/25 bg-[#041b3a]/75 backdrop-blur-lg text-[10px] font-mono tracking-wide text-sky-100"><Images size={12} className="text-sky-300"/> PROJECT PREVIEW</div></div>
   <div className="px-3 pb-7 md:px-0 md:pb-0 md:pr-7"><span className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-blue-600">{project.category}</span><h3 className="mt-4 text-[27px] sm:text-3xl lg:text-[37px] leading-[1.15] tracking-tight font-extrabold text-[#0c2448]">{project.title}</h3><p className="mt-2 text-sm font-semibold text-[#0877b9]">{project.subtitle}</p><div className="mt-5 max-w-lg text-[14px] leading-[1.85] text-[#506480] jmc-cms-rich" dangerouslySetInnerHTML={{__html:project.description}}/><div className="mt-6 flex flex-wrap gap-2">{project.technologies.map(t=><span key={t} className="jmc-badge">{t}</span>)}</div>
   {project.link?<a href={project.link} target="_blank" rel="noopener noreferrer" className="jmc-button mt-7">View Project <ArrowUpRight size={17}/></a>:<button onClick={()=>setSelected(project)} className="jmc-button mt-7">View Project <ArrowUpRight size={17}/></button>}
   </div></div></article>)}
   {showFuture&&<div className="jmc-card jmc-card-white relative flex flex-col md:flex-row gap-5 items-center justify-between p-7 md:p-9 border-dashed"><div><span className="text-xs font-mono font-semibold tracking-widest text-blue-600">WHAT'S NEXT</span><h3 className="mt-3 text-2xl font-extrabold text-[#0c2448]">More Experiences Coming Soon</h3><p className="mt-2 text-sm text-[#506480]">Explore opportunities for collaboration and new immersive projects.</p></div><Link to="/contact" className="jmc-button">Start a Project <ArrowUpRight size={17}/></Link></div>}
  </div></div></section>
  {selected&&createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03102a]/85 backdrop-blur-md p-5" role="dialog" aria-modal="true" aria-label={selected.title} onClick={()=>setSelected(null)}><div className="relative max-w-3xl w-full bg-white rounded-[24px] p-5 sm:p-9 shadow-2xl" onClick={e=>e.stopPropagation()}><button onClick={()=>setSelected(null)} className="absolute top-5 right-5 rounded-full bg-slate-100 text-slate-900 p-2" aria-label="Close dialog"><X size={20}/></button><div className="relative aspect-video mt-8 overflow-hidden rounded-xl bg-[#061631]"><Photo project={selected}/></div><h2 className="mt-6 text-2xl font-bold text-[#082049]">{selected.title}</h2><div className="mt-3 text-sm text-slate-600 jmc-cms-rich" dangerouslySetInnerHTML={{__html:selected.description}}/></div></div>,document.body)}
 </>;
}
