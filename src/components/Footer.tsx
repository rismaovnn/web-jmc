import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, Mail, Globe2, Instagram } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useContent } from '../cms/ContentContext';
const links = [
  { label: 'Home', to: '/' }, { label: 'About', to: '/about' },
  { label: 'Products', to: '/product' }, { label: 'Partners', to: '/partners' }, { label: 'Contact', to: '/contact' },
];
export default function Footer() {
  const { footer, contact } = useContent();
  return <footer className="jmc-footer relative overflow-hidden border-t border-sky-300/15 bg-[#030a1e] text-white pt-20 pb-8">
    <div className="absolute right-[-160px] top-[-220px] h-[560px] w-[560px] rounded-full bg-blue-600/10 blur-[110px] pointer-events-none" aria-hidden="true" />
    <div className="jmc-wrap relative z-10">
      <div className="grid gap-12 md:grid-cols-[1.45fr_1fr_1fr]">
        <div><BrandLogo className="!gap-3" />
          <h2 className="mt-7 text-4xl lg:text-5xl font-extrabold tracking-tighter leading-tight">Own the <span className="jmc-title-gradient">Future.</span></h2>
          <div className="mt-4 max-w-sm text-sm leading-7 text-[#a7b9d8] jmc-cms-rich" dangerouslySetInnerHTML={{__html:footer.description}}/>
          <Link to="/contact" className="jmc-button mt-6">Start Your Project <ArrowUpRight size={16}/></Link>
        </div>
        <div><p className="font-mono text-[11px] font-semibold tracking-[.2em] text-sky-300 uppercase">Explore</p>
          <nav aria-label="Footer navigation" className="mt-6 flex flex-col items-start gap-3.5">
            {links.map(link=><NavLink key={link.to} to={link.to} className="text-sm text-slate-300 hover:text-sky-300 transition-colors">{link.label}</NavLink>)}
          </nav>
        </div>
        <div><p className="font-mono text-[11px] font-semibold tracking-[.2em] text-sky-300 uppercase">Get in Touch</p>
          <p className="mt-6 text-sm leading-7 text-slate-300">Have an idea for a virtual tour, metaverse, or interactive experience?</p>
          <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-sky-300 hover:text-white transition-colors text-sm font-semibold"><Mail size={16}/> Contact JuaraMetaCorp <ArrowUpRight size={15}/></Link>
          <p className="mt-7 inline-flex items-center gap-2 text-xs text-[#849ac0]"><Globe2 size={15}/> Creative Technology Studio</p>
          <div className="mt-5 flex items-center gap-3">
            {contact.instagram ? <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="jmc-social-link" aria-label="Official JuaraMetaCorp Instagram"><Instagram size={21}/><span>Instagram</span><ArrowUpRight size={14}/></a>
            : <span className="jmc-social-link" aria-label="Instagram account URL pending confirmation"><Instagram size={21}/><span>Instagram</span></span>}
            {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="jmc-social-link">LinkedIn <ArrowUpRight size={14}/></a>}
            {contact.website && <a href={contact.website} target="_blank" rel="noopener noreferrer" className="jmc-social-link">Website <ArrowUpRight size={14}/></a>}
            {footer.socialLinks.filter(item=>item.url).map(item=><a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer" className="jmc-social-link">{item.label}<ArrowUpRight size={14}/></a>)}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="jmc-footer-wordmark">JUARAMETACORP</div>
      <div className="mt-4 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-between text-[11px] text-[#879abd]">
        <span>© {new Date().getFullYear()} {footer.copyright}</span>
        <span>Designed for immersive futures · {footer.tagline}</span>
      </div>
    </div>
  </footer>;
}
