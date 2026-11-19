import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
interface CtaBandProps{title:string;description:string;tone?:'dark'|'light'}
export default function CtaBand({title,description,tone='dark'}:CtaBandProps){return <section className={`jmc-section jmc-top-border ${tone==='light'?'jmc-section-light':''}`}>
  <div className="jmc-wrap"><div className={`jmc-card ${tone==='dark'?'jmc-card-white':''} relative !overflow-hidden text-center px-6 sm:px-12 py-16 md:py-20 !border-sky-300/35`}>
    <div className="absolute -top-45 left-1/2 -translate-x-1/2 rounded-full w-[650px] h-[470px] bg-blue-500/15 blur-[90px] pointer-events-none"/>
    <div className="relative z-10 max-w-2xl mx-auto"><div className="mx-auto w-13 h-13 rounded-2xl grid place-items-center bg-yellow-400 text-[#0b1c40] shadow-[0_0_30px_rgba(255,207,24,.2)]"><Sparkles size={25}/></div>
      <h2 className="mt-7 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">{title}</h2>
      <p className="mt-5 mx-auto max-w-xl text-base jmc-card-subtext leading-8">{description}</p>
      <div className="mt-8 flex justify-center flex-wrap gap-3"><Link className="jmc-button" to="/contact">Start Your Project <ArrowUpRight size={17}/></Link><Link className={`jmc-button ${tone==='dark'?'jmc-button-outline-dark':'jmc-button-secondary'}`} to="/product">Explore Our Products <ArrowUpRight size={17}/></Link></div>
    </div>
  </div></div>
</section>}
