import { useRef, type PointerEvent, type MouseEvent } from 'react';
import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Landmark, School } from 'lucide-react';
import { useContent } from '../cms/ContentContext';
import type { Partner } from '../cms/schema';

const LOOP_DURATION_SECONDS = 36;

function PartnerBadge({ partner, duplicate }: { partner: Partner; duplicate: boolean }) {
  const Icon = /school/i.test(partner.name)?School:/university|universitas|stkip/i.test(partner.name)?GraduationCap:/government/i.test(partner.category)?Landmark:BriefcaseBusiness;
  return <a
    className="jmc-partner-badge"
    href={partner.website}
    target="_blank"
    rel="noopener noreferrer"
    tabIndex={duplicate ? -1 : 0}
    aria-hidden={duplicate ? true : undefined}
    draggable={false}
    title={`Visit ${partner.name}`}
  >
    <span className="jmc-partner-gold-icon"><Icon size={17} aria-hidden="true" /></span>
    <span className="jmc-partner-logo-box">
      <span className="jmc-partner-logo-initials" aria-hidden="true">{partner.name.substring(0,5)}</span>
      <img loading="lazy" src={partner.logo} alt="" draggable={false} referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }} />
    </span>
    <span className="jmc-partner-name">{partner.name}</span>
    <ArrowUpRight size={15} aria-hidden="true" className="jmc-partner-arrow" />
  </a>;
}

interface DragSession { startX: number; startTranslate: number; currentTranslate: number; groupWidth: number; pointerId: number; moved: boolean }
const normalize = (x: number, width: number) => width > 0 ? ((x % width) + width) % width - width : x;
function xTranslation(transform: string) {
  if (!transform || transform === 'none') return 0;
  const coords = transform.match(/matrix(?:3d)?\(([^)]+)\)/)?.[1]?.split(',').map(Number);
  if (!coords) return 0;
  return transform.startsWith('matrix3d') ? coords[12] ?? 0 : coords[4] ?? 0;
}

/**
 * Two identical equal-width groups create a gapless CSS -50% loop.
 * Drag pauses CSS animation, moves via transform only, and resumes from its
 * new phase using a negative animation-delay (no React renders per frame).
 */
export default function PartnerMarquee() {
  const { partners } = useContent();
  const sorted = [...partners].sort((a,b)=>a.order-b.order);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragSession | null>(null);
  const suppressClickRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  function pointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const track = trackRef.current;
    const width = groupRef.current?.getBoundingClientRect().width || 0;
    if (!track || !width) return;
    suppressClickRef.current = false;
    const translate = normalize(xTranslation(getComputedStyle(track).transform), width);
    track.style.animation = 'none';
    track.style.transform = `translate3d(${translate}px, 0, 0)`;
    dragRef.current = { startX: e.clientX, startTranslate: translate, currentTranslate: translate, groupWidth: width, pointerId: e.pointerId, moved: false };
    // Capture only after a real drag, so normal clicks still open partner sites.
  }
  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !track) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 5 && !drag.moved) {
      drag.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.classList.add('is-dragging');
    }
    const next = normalize(drag.startTranslate + dx, drag.groupWidth);
    drag.currentTranslate = next;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      track.style.transform = `translate3d(${next}px, 0, 0)`;
      rafRef.current = null;
    });
  }
  function pointerUp(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !track) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    e.currentTarget.classList.remove('is-dragging');
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    // Negative delay aligns the CSS timeline with the end of the drag.
    track.style.animationDelay = `${(drag.currentTranslate / drag.groupWidth) * LOOP_DURATION_SECONDS}s`;
    track.style.transform = '';
    track.style.animation = '';
  }
  function blockClickAfterDrag(e: MouseEvent<HTMLDivElement>) {
    if (suppressClickRef.current) { e.preventDefault(); e.stopPropagation(); suppressClickRef.current = false; }
  }

  return <div className="jmc-partner-marquee" aria-label="JuaraMetaCorp trusted partner logos">
    <div className="jmc-partner-marquee-fade jmc-partner-marquee-fade-left" aria-hidden="true" />
    <div className="jmc-partner-marquee-fade jmc-partner-marquee-fade-right" aria-hidden="true" />
    <div className="jmc-partner-marquee-viewport" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onClickCapture={blockClickAfterDrag}>
      <div ref={trackRef} className="jmc-partner-marquee-track">
        <div ref={groupRef} className="jmc-partner-marquee-group">
          {sorted.map(partner => <PartnerBadge partner={partner} key={partner.id} duplicate={false} />)}
        </div>
        <div className="jmc-partner-marquee-group" aria-hidden="true">
          {sorted.map(partner => <PartnerBadge partner={partner} key={`${partner.id}-duplicate`} duplicate />)}
        </div>
      </div>
    </div>
  </div>;
}
