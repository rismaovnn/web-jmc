import { Eye, Target, Sparkles } from 'lucide-react';
import PageHero from '../components/PageHero';
import { useContent } from '../cms/ContentContext';
import Leadership from '../components/Leadership';
import CtaBand from '../components/CtaBand';

export default function AboutPage(){const {about}=useContent();return <>
  <PageHero badge="About JuaraMetaCorp" title={<>Building the <span className="jmc-title-gradient">future of experience.</span></>} description={about.description.replace(/<[^>]*>/g, " ")} />
  <section className="jmc-section jmc-section-light jmc-top-border" id="mission"><div className="jmc-wrap">
    <div className="max-w-2xl mb-12"><span className="jmc-eyebrow">Purpose & Direction</span><h2 className="jmc-title">What Drives <span className="jmc-title-gradient">Us.</span></h2><div className="jmc-description mt-4 jmc-cms-rich" dangerouslySetInnerHTML={{__html:about.description}}/></div>
    <div className="grid lg:grid-cols-2 gap-5">
      <article className="jmc-card jmc-hover p-8 sm:p-10"><div className="grid place-items-center w-13 h-13 rounded-2xl bg-yellow-400 text-[#09152e]"><Eye size={25}/></div><span className="block mt-7 text-xs font-mono text-sky-300 tracking-widest uppercase">Our Vision</span><div className="mt-3 text-xl md:text-2xl leading-relaxed font-bold jmc-cms-rich" dangerouslySetInnerHTML={{__html:about.vision}}/></article>
      <article className="jmc-card jmc-hover p-8 sm:p-10"><div className="grid place-items-center w-13 h-13 rounded-2xl bg-yellow-400 text-[#09152e]"><Target size={25}/></div><span className="block mt-7 text-xs font-mono text-sky-300 tracking-widest uppercase">Our Mission</span><div className="mt-4 text-[14px] leading-7 text-[#adc0dd] jmc-cms-rich" dangerouslySetInnerHTML={{__html:about.mission}}/></article>
    </div>
    <div className="mt-7 jmc-card p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center"><span className="rounded-2xl p-4 bg-blue-500/15 text-cyan-300"><Sparkles size={23}/></span><div><h3 className="text-lg font-bold">Where creativity meets technology</h3><p className="jmc-description mt-2">From first concept to launch-ready experience, we combine thoughtful design and technology to build solutions that work beautifully together.</p></div></div>
  </div></section>
  <Leadership />
  <CtaBand tone="light" title="Let's Create What Comes Next." description="Get to know JuaraMetaCorp and tell us about the digital experience you envision."/>
</>}
