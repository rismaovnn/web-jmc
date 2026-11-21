import { useEffect, useRef } from 'react';
import { mountSpriteMascot } from '../mascot-engine/index.js';
import './sprite-mascot.css';

/**
 * JuaraMetaCorp hero mascot — real animated poses extracted from the user's MP4.
 * The animation engine is Vanilla JS and is controlled by the cursor in the HERO,
 * not by a looping video timeline. React only owns the mount/unmount lifecycle.
 */
export default function SpriteMascot() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cleanup: (() => void) | undefined;
    let unmounted = false;

    const hero = root.closest('#home') || root;
    mountSpriteMascot(root, {
      hero: hero as HTMLElement,
      manifestUrl: '/mascot-sprite/manifest.json',
    }).then(dispose => {
      if (unmounted) dispose();
      else cleanup = dispose;
    }).catch(error => console.error('JuaraMetaCorp mascot:', error));

    return () => {
      unmounted = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="jmc-sprite-root" aria-label="Maskot JuaraMetaCorp interaktif. Gerakkan kursor di area Hero untuk melihat maskot menoleh.">
      <div className="jmc-sprite-ambient" aria-hidden="true" />
      <div className="jmc-sprite-ring jmc-sprite-ring-a" aria-hidden="true" />
      <div className="jmc-sprite-ring jmc-sprite-ring-b" aria-hidden="true" />
      <div className="jmc-sprite-star jmc-sprite-star-a" aria-hidden="true">✦</div>
      <div className="jmc-sprite-star jmc-sprite-star-b" aria-hidden="true">✧</div>

      <div data-sprite-stage className="jmc-sprite-stage">
        <div className="jmc-sprite-frame">
          <img
            className="jmc-sprite-poster"
            data-sprite-poster
            src="/mascot-sprite/poster.png"
            width={720}
            height={1280}
            alt="Maskot JuaraMetaCorp memakai headset VR, dari animasi yang diunggah"
            fetchPriority="high"
            decoding="async"
          />
          <canvas data-sprite-canvas className="jmc-sprite-canvas" aria-hidden="true" />
        </div>
      </div>

      <div className="jmc-sprite-accent" aria-hidden="true">
        <span className="jmc-sprite-accent-dot" />
        INTERACTIVE EXPERIENCE
      </div>
    </div>
  );
}
