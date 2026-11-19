import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig, useReducedMotion, useScroll, useSpring } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MotionExperience from './components/MotionExperience';
import { ContentProvider } from './cms/ContentContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    if (hash) {
      const timeout = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 500);
      return () => window.clearTimeout(timeout);
    }
  }, [pathname, hash]);
  return null;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 125, damping: 30, restDelta: 0.001 });
  return <motion.div className="jmc-scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

function AnimatedPage() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  return <AnimatePresence initial={false} mode="wait">
    <motion.div
      key={pathname}
      className="jmc-page"
      initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={reduced ? { opacity: 1 } : { opacity: 0, y: -10, filter: 'blur(3px)' }}
      transition={{ duration: reduced ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <Suspense fallback={<div className="jmc-page-loading" role="status" aria-label="Loading page" />}>
        <MotionExperience>{outlet}</MotionExperience>
      </Suspense>
    </motion.div>
  </AnimatePresence>;
}

function Layout() {
  return <div className="jmc-site font-sans antialiased overflow-x-hidden relative">
    <ScrollToTop />
    <ScrollProgress />
    <Navbar />
    <main className="relative z-10"><AnimatedPage /></main>
    <Footer />
  </div>;
}

export default function App() {
  return <MotionConfig reducedMotion="user">
    <ContentProvider><BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Suspense fallback={<div>Loading CMS…</div>}><AdminPage/></Suspense>}/>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="product" element={<ProductPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter></ContentProvider>
  </MotionConfig>;
}
