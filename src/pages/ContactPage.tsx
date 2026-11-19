import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, LoaderCircle, Mail, MessageSquareText, AlertCircle } from 'lucide-react';
import PageHero from '../components/PageHero';
import BrandLogo from '../components/BrandLogo';
import { useContent } from '../cms/ContentContext';

const projectTypes = ['Virtual Tour / 360', 'Metaverse / Virtual World', 'XR & Interactive Learning', 'Website / Application', 'Other Creative Technology'];
type Notice = { kind: 'success' | 'error'; text: string } | null;

export default function ContactPage() {
  const reduced = useReducedMotion();
  const { contact } = useContent();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [details, setDetails] = useState('');
  const [website, setWebsite] = useState(''); // spam honeypot
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    setNotice(null);
    if (!form.reportValidity() || name.trim().length < 2 || details.trim().length < 20) {
      setNotice({ kind: 'error', text: 'Please enter your name and at least 20 characters describing your project.' });
      return;
    }
    setSending(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 30_000);
      let response: Response;
      try {
        response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), projectType, details: details.trim(), website }),
          signal: controller.signal,
        });
      } finally { window.clearTimeout(timeout); }
      const result: { message?: string } = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'We could not send your message. Please try again.');
      setNotice({ kind: 'success', text: result.message || 'Your project inquiry has been sent successfully.' });
      setName(''); setEmail(''); setProjectType(projectTypes[0]); setDetails(''); setWebsite('');
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error && error.name === 'AbortError'
        ? 'The request timed out. Please try again.'
        : error instanceof Error ? error.message : 'Unable to send your message. Please try again.' });
    } finally { setSending(false); }
  }

  return <>
    <PageHero badge="Get in Touch" title={<>Let's make ideas <span className="jmc-title-gradient">happen.</span></>}
      description="Tell us about your idea and send a project inquiry directly to the JuaraMetaCorp team." />
    <section className="jmc-section jmc-section-light jmc-top-border">
      <div className="jmc-wrap grid lg:grid-cols-[.88fr_1.12fr] gap-6 lg:gap-10 items-start">
        <div className="jmc-card p-8 sm:p-10">
          <BrandLogo />
          <h2 className="mt-10 text-3xl font-extrabold leading-tight tracking-tight">Create something <span className="jmc-title-gradient">extraordinary.</span></h2>
          <p className="jmc-description mt-5">From 360° tours to metaverse worlds and digital learning spaces, great projects begin with the right conversation.</p>
          <div className="mt-9 pt-7 border-t border-white/10 space-y-5">
            <div className="flex items-center gap-3"><span className="grid place-items-center p-3 rounded-xl bg-blue-500/15 text-cyan-300"><MessageSquareText size={20}/></span><span className="text-sm text-[#b3c8e5]">Project discovery &amp; creative technology</span></div>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sky-300 hover:text-white break-all"><span className="grid place-items-center p-3 rounded-xl bg-blue-500/15"><Mail size={20}/></span>{contact.email}</a>
            {contact.phone && <a href={`tel:${contact.phone.replace(/[^0-9+]/g,'')}`} className="text-sky-300 text-sm block">{contact.phone}</a>}
            {contact.address && <p className="text-sm text-[#b3c8e5]">{contact.address}</p>}
            {contact.mapsUrl && <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sky-300 text-sm">View on Google Maps ↗</a>}
          </div>
        </div>
        <div className="jmc-card p-8 sm:p-10">
          <span className="jmc-eyebrow">Start a Conversation</span>
          <h2 className="mt-5 text-2xl sm:text-3xl tracking-tight font-extrabold">Tell us about your project</h2>
          <p className="mt-3 text-sm text-[#a4b9dc] leading-7">Complete the form below and your inquiry will be sent directly to JuaraMetaCorp.</p>
          <form onSubmit={submit} className="mt-8 space-y-5" noValidate={false}>
            <div className="grid sm:grid-cols-2 gap-5">
              <label htmlFor="inquiry-name" className="block text-xs font-semibold text-slate-300">Your Name
                <input id="inquiry-name" value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={100} disabled={sending} autoComplete="name" placeholder="Full name" className="jmc-form-field mt-2 text-sm" />
              </label>
              <label htmlFor="inquiry-email" className="block text-xs font-semibold text-slate-300">Email Address
                <input id="inquiry-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} disabled={sending} autoComplete="email" placeholder="email@example.com" className="jmc-form-field mt-2 text-sm" />
              </label>
            </div>
            <label htmlFor="inquiry-type" className="block text-xs font-semibold text-slate-300">Project Type
              <select id="inquiry-type" className="jmc-form-field mt-2 text-sm" value={projectType} onChange={e => setProjectType(e.target.value)} disabled={sending} required>
                {projectTypes.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label htmlFor="inquiry-details" className="block text-xs font-semibold text-slate-300">Project Details
              <textarea id="inquiry-details" required minLength={20} maxLength={5000} rows={5} value={details} onChange={e => setDetails(e.target.value)} disabled={sending} placeholder="Tell us about your idea, goals, audience, and timeline..." className="jmc-form-field mt-2 text-sm resize-y" />
              <span className="mt-2 block text-[11px] text-[#91a9c9]">{details.trim().length}/5000 characters · minimum 20</span>
            </label>
            <div aria-hidden="true" className="jmc-honeypot"><label htmlFor="company-website">Company website</label><input id="company-website" type="text" tabIndex={-1} value={website} onChange={e=>setWebsite(e.target.value)} autoComplete="off" /></div>
            <button type="submit" disabled={sending} aria-busy={sending} className="jmc-button w-full sm:w-auto disabled:opacity-65 disabled:cursor-wait">
              {sending ? <><LoaderCircle size={17} className="animate-spin"/> Sending Inquiry...</> : <>Send Project Inquiry <ArrowUpRight size={17}/></>}
            </button>
            <AnimatePresence mode="wait">
              {notice && <motion.div key={`${notice.kind}-${notice.text}`} role={notice.kind === 'error' ? 'alert' : 'status'} aria-live="polite"
                initial={reduced ? false : { opacity: 0, y: 10, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduced ? 0 : .28 }} className={`jmc-inquiry-notice ${notice.kind === 'success' ? 'jmc-inquiry-success' : 'jmc-inquiry-error'}`}>
                {notice.kind === 'success' ? <CheckCircle2 size={19} className="shrink-0"/> : <AlertCircle size={19} className="shrink-0"/>}<span>{notice.text}</span>
              </motion.div>}
            </AnimatePresence>
            <p className="text-xs text-[#91a9c9] leading-5">Your inquiry is delivered securely through our email server. We use the information solely to respond to your project request.</p>
          </form>
        </div>
      </div>
    </section>
  </>;
}
