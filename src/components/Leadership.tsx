import { motion } from 'motion/react';
import { Crown, Network, Users } from 'lucide-react';
import { useContent } from '../cms/ContentContext';
import type { Leader } from '../cms/schema';
function Profile({member,highlight=false,index=0}:{member:Leader;highlight?:boolean;index?:number}){
 return <motion.article initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.45,delay:Math.min(index*.07,.3)}} className={`jmc-card jmc-card-white jmc-hover flex flex-col sm:flex-row md:flex-col xl:flex-row items-center text-center sm:text-left md:text-center xl:text-left gap-5 p-5 sm:p-6 min-h-[156px] ${highlight?'!border-cyan-400/50 shadow-[0_0_40px_rgba(34,168,255,.14)]':''}`}>
  <div className="jmc-avatar">{member.photo?<img src={member.photo} alt={`Portrait of ${member.name}`} loading="lazy"/>:<div className="grid place-items-center w-full h-full bg-blue-100 text-blue-700 font-bold">{member.name[0]}</div>}</div>
  <div className="min-w-0"><h4 className="text-sm sm:text-base lg:text-[15px] leading-6 font-bold text-[#102a52] break-words">{member.name}</h4><p className="mt-2 text-xs font-semibold text-[#1477b7] leading-5">{member.role}</p>{member.bio&&<div className="text-xs text-slate-600 mt-3 jmc-cms-rich" dangerouslySetInnerHTML={{__html:member.bio}}/>}</div>
 </motion.article>;
}
export default function Leadership(){
 const {leadership}=useContent();const sorted=[...leadership].sort((a,b)=>a.order-b.order);
 const board=sorted.filter(x=>x.group==='board'),ceo=sorted.filter(x=>x.group==='ceo'),management=sorted.filter(x=>x.group==='management');
 return <section id="leadership" className="jmc-section jmc-section-alt jmc-top-border"><div className="jmc-wrap">
  <div className="text-center max-w-2xl mx-auto mb-15"><span className="jmc-eyebrow">Meet Our Leadership</span><h2 className="jmc-title">The People Behind <span className="jmc-title-gradient">JuaraMetaCorp.</span></h2><p className="jmc-description mx-auto mt-5">Meet our Board of Directors, CEO, and management team.</p></div>
  <div className="max-w-6xl mx-auto relative">
   {!!board.length&&<><div className="mb-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[.2em] font-mono font-semibold text-cyan-300"><Crown size={16}/> Board of Directors</div><div className="grid md:grid-cols-3 gap-5">{board.map((x,i)=><Profile member={x} key={x.id} index={i}/>)}</div></>}
   {!!ceo.length&&<><div className="jmc-org-stem" aria-hidden="true"/><div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[.2em] font-mono font-semibold text-cyan-300 mb-5"><Network size={16}/> Chief Executive Officer</div><div className="max-w-md mx-auto space-y-5">{ceo.map((x,i)=><Profile key={x.id} member={x} index={i+3} highlight/>)}</div></>}
   {!!management.length&&<><div className="jmc-org-stem" aria-hidden="true"/><div className="mb-5 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[.2em] font-mono font-semibold text-cyan-300"><Users size={16}/> Management Team</div><div className="grid md:grid-cols-3 gap-5">{management.map((x,i)=><Profile member={x} key={x.id} index={i+4}/>)}</div></>}
  </div>
 </div></section>;
}
