import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, TrendingUp, ArrowRight, Star, Zap, Code2, MessageCircle, Link2 } from 'lucide-react';

// ── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  { icon: Upload, title: 'Connect your context', desc: 'Sign up and tell us your branch, target role, and goals. Upload your resume and study materials.' },
  { icon: Sparkles, title: 'Let the agents work', desc: 'Seven specialized AI agents analyze your resume, study patterns, and skill gaps in the background.' },
  { icon: TrendingUp, title: 'Act on a clear plan', desc: 'Get a daily plan, weekly goals, and a career roadmap — all grounded in your actual data, not generic advice.' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-10 bg-bg-primary">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-brand-cyan text-sm font-semibold tracking-wide uppercase">Built for momentum</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3">From sign-up to your first plan in minutes</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-px bg-gradient-to-r from-brand-blue/0 via-brand-blue/40 to-brand-blue/0" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-bg-card border border-brand-blue/30 flex items-center justify-center mx-auto mb-5 relative z-10 shadow-glow-blue/20">
                <s.icon size={22} className="text-brand-blue-light" />
              </div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Ananya R.', role: 'Final-year CSE, NIT Trichy', quote: 'The exam planner alone saved me from cramming. It actually accounted for how much syllabus I had left.', avatar: 'AR' },
  { name: 'Karthik M.', role: 'Pre-final, VIT Vellore', quote: 'Uploaded my resume and the ATS score plus missing skills list was more specific than any career office advice I got.', avatar: 'KM' },
  { name: 'Sneha P.', role: '3rd year, BITS Pilani', quote: 'I use the document tutor for every lecture PDF now — the flashcards it generates are genuinely useful for revision.', avatar: 'SP' },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 lg:px-10 bg-bg-secondary">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-brand-cyan text-sm font-semibold tracking-wide uppercase">Early users</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3">Students are already shipping their goals</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-bg-card border border-border-primary rounded-2xl p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => <Star key={idx} size={13} className="fill-brand-amber text-brand-amber" />)}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-text-muted text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────────────────────
export function CTASection() {
  return (
    <section id="pricing" className="py-24 px-6 lg:px-10 bg-bg-primary relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-blue/20 rounded-full blur-[150px]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center relative z-10 bg-bg-card border border-border-primary rounded-3xl p-12 shadow-glow-blue/20"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
          <Zap size={22} className="text-white" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to operate your academic life differently?</h2>
        <p className="text-text-secondary mb-8 max-w-lg mx-auto">
          Free to start. No credit card. Your seven AI agents are ready whenever you are.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-brand-blue text-white font-medium px-7 py-3.5 rounded-xl shadow-glow-blue hover:bg-brand-blue-light transition-all hover:-translate-y-0.5"
        >
          Create your free account <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-primary py-12 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-blue flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">StudentOS <span className="text-brand-cyan">AI</span></span>
            </div>
            <p className="text-text-muted text-sm max-w-xs">
              Your AI academic & career operating system — built by students who got tired of using five different apps.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10">
            <div>
              <p className="text-white text-sm font-semibold mb-3">Product</p>
              <div className="space-y-2">
                {['Features', 'AI Agents', 'How it works'].map((l) => (
                  <a key={l} href="#" className="block text-text-muted text-sm hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-3">Company</p>
              <div className="space-y-2">
                {['About', 'Contact', 'Careers'].map((l) => (
                  <a key={l} href="#" className="block text-text-muted text-sm hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-3">Legal</p>
              <div className="space-y-2">
                {['Privacy', 'Terms'].map((l) => (
                  <a key={l} href="#" className="block text-text-muted text-sm hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border-primary">
          <p className="text-text-muted text-xs">© 2026 StudentOS AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-text-muted hover:text-white"><Code2 size={16} /></a>
            <a href="#" className="text-text-muted hover:text-white"><MessageCircle size={16} /></a>
            <a href="#" className="text-text-muted hover:text-white"><Link2 size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
