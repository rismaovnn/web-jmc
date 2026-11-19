import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import BrandLogo from './BrandLogo';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/product' },
  { label: 'Partners', to: '/partners' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const measure = () => setScrolled(window.scrollY > 22);
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    return () => window.removeEventListener('scroll', measure);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  return (
    <motion.header initial={reduced ? false : { opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .65 }} className={`jmc-navbar fixed inset-x-0 top-3 md:top-5 z-50 px-4 ${scrolled ? 'jmc-nav-scrolled' : ''}`} role="banner">
      <div className="max-w-[1190px] mx-auto rounded-full h-[68px] px-4 sm:px-6 flex items-center justify-between gap-4 border border-sky-200/15 bg-[#071738]/85 backdrop-blur-2xl shadow-[0_8px_38px_rgba(0,3,21,.48),inset_0_1px_0_rgba(195,226,255,.05)]">
        <Link to="/" aria-label="JuaraMetaCorp — Home" className="shrink-0"><BrandLogo /></Link>
        <nav aria-label="Main navigation" className="hidden lg:flex gap-1.5 items-center">
          {navLinks.map(link => <NavLink key={link.to} end to={link.to} className={({isActive})=>`relative py-2.5 px-4 text-xs font-semibold rounded-full transition-colors duration-300 ${isActive?'text-white':'text-slate-400 hover:text-white'}`}>
            {({isActive})=><>{isActive&&<motion.span layoutId="active-navigation-pill" transition={{type:'spring',stiffness:350,damping:35}} className="absolute inset-0 rounded-full border border-sky-200/20 bg-white/[.09] shadow-[0_0_18px_rgba(59,168,255,.16)]"/>}<span className="relative">{link.label}</span></>}
          </NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/contact" className="hidden sm:inline-flex jmc-button !px-5 !py-2.5 !text-xs">Start Project <ArrowUpRight size={15}/></Link>
          <button type="button" className="lg:hidden rounded-full border border-sky-200/20 p-2.5 text-white hover:bg-white/10 transition-colors" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open?'Close menu':'Open menu'} onClick={()=>setOpen(v=>!v)}>{open?<X size={20}/>:<Menu size={20}/>}</button>
        </div>
      </div>
      <AnimatePresence>
        {open && <motion.nav id="mobile-navigation" aria-label="Mobile navigation" initial={{opacity:0,y:-12,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-12,scale:.98}} transition={{duration:.22}} className="lg:hidden mt-2 mx-auto max-w-[1190px] p-3 rounded-3xl border border-sky-200/20 bg-[#071738]/95 backdrop-blur-2xl shadow-2xl">
          {navLinks.map(link=><NavLink key={link.to} end to={link.to} className={({isActive})=>`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive?'bg-blue-500/20 text-sky-200':'text-slate-300 hover:text-white hover:bg-white/10'}`}>{link.label}</NavLink>)}
          <Link to="/contact" className="mt-3 w-full jmc-button">Start Project <ArrowUpRight size={16}/></Link>
        </motion.nav>}
      </AnimatePresence>
    </motion.header>
  );
}
