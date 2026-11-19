import PageHero from '../components/PageHero';
import Services from '../components/Services';
import ProjectShowcase from '../components/ProjectShowcase';
import CtaBand from '../components/CtaBand';
export default function ProductPage(){return <>
  <PageHero badge="Products & Capabilities" title={<>Technology that <span className="jmc-title-gradient">creates experiences.</span></>} description="Discover our creative technology capabilities and selected projects designed for exploration and education."/>
  <Services/>
  <ProjectShowcase/>
  <CtaBand tone="light" title="Build Something Remarkable." description="Tell us your idea, and let us explore the possibilities for your next project."/>
</>}
