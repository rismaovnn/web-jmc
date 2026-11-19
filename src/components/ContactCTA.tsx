import { useState, FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Shield, Clock } from 'lucide-react';

export default function ContactCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="py-24 max-w-6xl mx-auto px-4 md:px-8" id="contact">
      <div className="relative rounded-3xl p-8 sm:p-12 md:p-20 overflow-hidden bg-gradient-to-b from-[#1a66be] via-[#0b37a5] to-[#01176b] border-2 border-yellow-400/35 shadow-[0_20px_70px_-10px_rgba(250,204,21,0.25)] text-center flex flex-col items-center">
        {/* Glow Halos: Golden Sun & Violet Sheen */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-yellow-400/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider mb-6 shadow-lg shadow-yellow-400/25">
            DEPLOY WITH CONFIDENCE
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Let’s Build Something <br className="hidden sm:inline" />
            <span className="text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.4)]">Legendary.</span>
          </h2>

          <p className="mt-4 text-blue-100 text-base sm:text-lg max-w-xl font-body">
            Accelerate your roadmap with enterprise spatial engineering and dedicated technical governance.
          </p>

          {/* Form / Submitted state */}
          {submitted ? (
            <div className="mt-8 p-6 max-w-md w-full bg-blue-950/90 border border-emerald-400/60 rounded-3xl text-center animate-in zoom-in-95 duration-200 shadow-xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">Inquiry Dispatched</h4>
              <p className="mt-1 text-xs text-blue-200">
                Confirmation sent to <span className="font-semibold text-yellow-300">{email}</span>. Our spatial engineering director will reach out within 2 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="mt-4 text-xs font-semibold text-yellow-400 hover:underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@enterprise.com"
                required
                className="flex-1 px-5 py-3.5 rounded-full bg-[#07193f]/90 border border-yellow-400/35 text-sm font-sans focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 shadow-xs text-white placeholder:text-blue-300/50"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-sm font-bold hover:brightness-110 shadow-lg shadow-yellow-400/30 transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Initiate Project</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-blue-200/80">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              100% Confidential NDA
            </span>
            <span className="text-purple-400">•</span>
            <span>Free Architecture Audit</span>
            <span className="text-purple-400">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              Response &lt; 2h
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

