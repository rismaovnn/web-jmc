import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import ProjectShowcase from '../components/ProjectShowcase';
import CompanyHighlight from '../components/CompanyHighlight';
import CtaBand from '../components/CtaBand';
export default function HomePage(){
  const navigate=useNavigate();
  return <>
    <Hero onStartProject={()=>navigate('/contact')} onExploreProducts={()=>document.getElementById('projects')?.scrollIntoView({behavior:'smooth'})}/>
    <FeaturedProducts />
    <ProjectShowcase />
    <CompanyHighlight />
    <CtaBand title="Let's Build the Next Experience." description="Turn your creative technology idea into a memorable, immersive digital experience with JuaraMetaCorp."/>
  </>;
}
