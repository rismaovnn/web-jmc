import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Progressive motion enhancement for non-hero sections.
 * Uses one IntersectionObserver, one pointer listener, and CSS transforms/opacity.
 * Nothing stays invisible if JS, IntersectionObserver, or animations are disabled.
 * The container is keyed by route in App, so every new page gets fresh reveals.
 */
export default function MotionExperience({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) return;

    const completionTimers = new Set<ReturnType<typeof setTimeout>>();
    const animationFrames = new Set<number>();
    const intersection = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        intersection.unobserve(element);
        const id = requestAnimationFrame(() => { animationFrames.delete(id); element.classList.add('jmc-motion-in'); });
        animationFrames.add(id);
        const delay = Number(element.dataset.jmcRevealDelay || '0');
        const timer = setTimeout(() => {
          element.classList.remove('jmc-motion-pending', 'jmc-motion-in');
          element.style.removeProperty('--jmc-motion-delay');
          completionTimers.delete(timer);
        }, delay + 900);
        completionTimers.add(timer);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    const selectors = [
      '.jmc-section .jmc-eyebrow',
      '.jmc-section .jmc-title',
      '.jmc-section .jmc-description',
      '.jmc-section .jmc-section-link',
      '.jmc-section .jmc-card',
      '.jmc-section .jmc-partner-trust-label',
      '.jmc-section .jmc-partner-marquee',
    ].join(',');

    function enhance() {
      if (!container) return;
      container.querySelectorAll<HTMLElement>(selectors).forEach((el) => {
        if (el.dataset.jmcMotionRegistered) return;
        el.dataset.jmcMotionRegistered = 'true';
        // Do not animate copy nested inside a card independently, and do not
        // double-animate leadership profiles (their React Motion handles them).
        if (el.closest('.jmc-card') && !el.classList.contains('jmc-card')) return;
        if (el.classList.contains('jmc-card') && el.closest('#leadership')) return;

        let delay = 0;
        if (el.classList.contains('jmc-card')) {
          const siblings = [...(el.parentElement?.children || [])].filter((node) => (node as Element).classList?.contains('jmc-card'));
          delay = Math.min(siblings.indexOf(el), 4) * 85;
          el.classList.add('jmc-spotlight');
        }
        el.dataset.jmcRevealDelay = String(delay);
        el.style.setProperty('--jmc-motion-delay', `${delay}ms`);
        el.classList.add('jmc-motion-pending');
        intersection.observe(el);
      });
    }

    // The app is lazy-loaded, so observe newly rendered content as well.
    enhance();
    const changes = new MutationObserver(enhance);
    changes.observe(container, { childList: true, subtree: true });

    // Update the hover spotlight and restrained 3D tilt using CSS variables;
    // no React rerender occurs during pointer movement.
    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>('.jmc-card.jmc-hover');
      if (!card || !container?.contains(card)) return;
      const rect = card.getBoundingClientRect();
      const fx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const fy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      card.style.setProperty('--jmc-pointer-x', `${Math.round(fx * 100)}%`);
      card.style.setProperty('--jmc-pointer-y', `${Math.round(fy * 100)}%`);
      // The spotlight follows the pointer, but avoid moving entire cards
      // on small touch screens or inside the contact form.
      if (card.closest('#projects')) {
        card.classList.add('jmc-tilt');
        card.style.setProperty('--jmc-tilt-x', `${((0.5 - fy) * 2.4).toFixed(2)}deg`);
        card.style.setProperty('--jmc-tilt-y', `${((fx - 0.5) * 2.4).toFixed(2)}deg`);
      }
    }
    function onOut(e: PointerEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>('.jmc-card.jmc-hover');
      if (!card || !container?.contains(card)) return;
      if (e.relatedTarget instanceof Node && card.contains(e.relatedTarget)) return;
      card.style.removeProperty('--jmc-tilt-x');
      card.style.removeProperty('--jmc-tilt-y');
    }
    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerout', onOut);
    return () => {
      changes.disconnect();
      intersection.disconnect();
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerout', onOut);
      for (const timer of completionTimers) clearTimeout(timer);
      for (const frame of animationFrames) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={containerRef} className="jmc-motion-experience">{children}</div>;
}
