import { ArrowUpRight, GraduationCap, Handshake, Layers3, MessagesSquare, Rocket, ScanEye } from 'lucide-react';
import PartnerMarquee from '../components/PartnerMarquee';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import CtaBand from '../components/CtaBand';

const models=[
  {icon:Handshake,title:'Project Collaboration',description:'We collaborate from discovery and planning through production and launch.'},
  {icon:GraduationCap,title:'Education Partnerships',description:'Supporting schools and institutions with engaging digital learning and campus experiences.'},
  {icon:Layers3,title:'Technology Ecosystem',description:'Bringing design, development, and immersive technologies together across platforms.'},
];
const steps=[
  {icon:MessagesSquare,title:'Discover',text:'We listen to your goals, audience, and experience requirements.'},
  {icon:ScanEye,title:'Design & Develop',text:'We design solutions, prototype interactions, and develop the experience.'},
  {icon:Rocket,title:'Launch & Evolve',text:'We prepare the launch and map out opportunities for future improvements.'},
];
export default function PartnersPage(){return <>
  <PageHero badge="Partners & Collaborations" title={<>Great experiences are <span className="jmc-title-gradient">built together.</span></>} description="Working with educators, organizations, and industry partners to bring ambitious digital experiences to life."/>
  <section id="partners" className="jmc-section jmc-section-light jmc-top-border"><div className="jmc-wrap">
    <span className="jmc-eyebrow">Our Network</span><h2 className="jmc-title">Partners That <span className="jmc-title-gradient">Matter.</span></h2>
    <p className="jmc-description mt-5">Collaborating with industry and education partners to make immersive technology more accessible.</p>
    <div className="mt-10 mb-3 flex justify-center"><span className="jmc-partner-trust-label">TRUSTED BY LEADERS ACROSS ENTERPRISE, GOVERNMENT &amp; EDUCATION</span></div>
    <PartnerMarquee />
    <p className="text-center mt-5 text-xs text-slate-500">Hover to pause · Drag or swipe to explore our partners</p>
  </div></section>
  <section className="jmc-section jmc-top-border"><div className="jmc-wrap">
    <span className="jmc-eyebrow">How We Work Together</span><h2 className="jmc-title">Let's <span className="jmc-title-gradient">Collaborate.</span></h2><p className="jmc-description mt-5">Creative and technical collaboration, from the first idea to the finished experience.</p>
    <div className="mt-12 grid md:grid-cols-3 gap-5">{models.map(({icon:Icon,title,description})=><article className="jmc-card jmc-card-white jmc-hover p-8" key={title}><span className="grid w-13 h-13 place-items-center rounded-2xl bg-yellow-400 text-[#061633]"><Icon size={25}/></span><h3 className="mt-7 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{description}</p></article>)}</div>
  </div></section>
  <section className="jmc-section jmc-section-light jmc-top-border"><div className="jmc-wrap"><span className="jmc-eyebrow">Our Process</span><h2 className="jmc-title">From Idea to <span className="jmc-title-gradient">Experience.</span></h2>
    <div className="mt-12 grid md:grid-cols-3 gap-5">{steps.map(({icon:Icon,title,text},idx)=><article className="jmc-card jmc-hover p-7" key={title}><div className="flex items-center justify-between"><Icon size={25} className="text-cyan-300"/><span className="text-[11px] font-mono text-sky-300">0{idx+1}</span></div><h3 className="mt-6 text-lg font-bold text-white">{title}</h3><p className="text-sm text-[#a4b9dc] mt-3 leading-7">{text}</p></article>)}</div>
    <Link to="/product#projects" className="jmc-section-link mt-9 inline-flex text-blue-700 font-semibold text-sm gap-2 hover:text-blue-950 transition-colors">Explore Our Products <ArrowUpRight size={16}/></Link>
  </div></section>
  <CtaBand title="Build the Future Together." description="Let's explore opportunities, develop ideas, and create digital experiences with lasting value."/>
</>}
