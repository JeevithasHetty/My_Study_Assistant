import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Zap, ArrowRight, FileText, BookOpen, CalendarDays, Target,
  Brain, Video, FileSearch, CheckCircle2, Sparkles, Menu, X,
  TrendingUp, Clock, Award, Users, Star, ChevronRight,
} from 'lucide-react';

// ── Animated neural network canvas background ──────────────────────────────
function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width, height;
    let nodes = [];

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const NODE_COUNT = Math.min(50, Math.floor((width * height) / 22000));
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.15 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.fill();
      });
      animationId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'AI Agents', href: '#agents' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg-primary/90 backdrop-blur-xl border-b border-border-primary' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center shadow-glow-blue">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">StudentOS <span className="text-brand-cyan">AI</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-text-secondary hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className="text-sm text-text-secondary hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-blue-light shadow-glow-blue/40 hover:shadow-glow-blue transition-all flex items-center gap-1.5"
          >
            Get started <ArrowRight size={14} />
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-bg-primary border-b border-border-primary overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block text-sm text-text-secondary hover:text-white py-1.5">
                  {l.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-border-primary">
                <Link to="/login" className="text-sm text-text-secondary text-center py-2">Sign in</Link>
                <Link to="/signup" className="text-sm font-medium bg-brand-blue text-white text-center px-4 py-2.5 rounded-lg">
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── Floating glass card (3D perspective hero element) ───────────────────────
function FloatingCard({ children, className = '', delay = 0, rotate = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ transform: `rotate(${rotate}deg)`, transformStyle: 'preserve-3d' }}
      className={`glass rounded-2xl p-4 shadow-card animate-float ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-hero-gradient">
      <NeuralBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/25 text-brand-cyan text-xs font-medium px-3 py-1.5 rounded-full mb-6"
            >
              <Sparkles size={12} />
              7-agent AI system, built for students
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6"
            >
              Your AI academic
              <br />
              & career <span className="gradient-text">operating system</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary max-w-lg mb-8 leading-relaxed"
            >
              Study smarter, prepare for placements, optimize your resume, and get
              personalized career guidance — all powered by a coordinated team of AI agents
              that actually know your academic context.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-brand-blue text-white font-medium px-6 py-3.5 rounded-xl shadow-glow-blue hover:bg-brand-blue-light transition-all hover:-translate-y-0.5"
              >
                Start for free <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-text-secondary hover:text-white font-medium px-6 py-3.5 rounded-xl border border-border-primary hover:border-brand-blue/40 transition-all"
              >
                See how it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-6 mt-10 text-text-muted text-sm"
            >
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-brand-green" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-brand-green" /> Free forever tier</span>
            </motion.div>
          </div>

          {/* Right: floating 3D glass cards */}
          <div className="relative h-[420px] hidden lg:block" style={{ perspective: '1200px' }}>
            <FloatingCard className="absolute top-0 right-2 w-64 z-20" delay={0.3} rotate={3}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-brand-blue/20 flex items-center justify-center">
                  <Brain size={13} className="text-brand-blue-light" />
                </div>
                <span className="text-xs font-semibold text-white">Career Coach Agent</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                "Your ATS score improved 12 points. Focus on system design this week — 3 target companies require it."
              </p>
            </FloatingCard>

            <FloatingCard className="absolute top-36 left-0 w-60 z-10" delay={0.45} rotate={-2}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white">ATS Score</span>
                <span className="text-xs text-brand-green font-bold">87%</span>
              </div>
              <div className="progress-dark h-1.5">
                <div className="progress-dark-fill" style={{ width: '87%' }} />
              </div>
              <p className="text-[10px] text-text-muted mt-2">+12 from last analysis</p>
            </FloatingCard>

            <FloatingCard className="absolute top-60 right-4 w-56 z-20" delay={0.6} rotate={2}>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={13} className="text-brand-cyan" />
                <span className="text-xs font-semibold text-white">Today's plan</span>
              </div>
              <div className="space-y-1.5">
                {['DSA — Trees & Graphs', 'Mock interview', 'Resume revision'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <div className="w-1 h-1 rounded-full bg-brand-cyan" /> {t}
                  </div>
                ))}
              </div>
            </FloatingCard>

            <FloatingCard className="absolute bottom-0 left-10 w-48 z-30" delay={0.75} rotate={-4}>
              <p className="text-[10px] text-text-muted mb-1">Placement readiness</p>
              <p className="text-2xl font-bold text-white">74<span className="text-sm text-text-muted">/100</span></p>
            </FloatingCard>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-24 pt-12 border-t border-border-primary"
        >
          {[
            { value: '7', label: 'Specialized AI agents' },
            { value: '12+', label: 'Academic & career tools' },
            { value: '24/7', label: 'AI availability' },
            { value: '0₹', label: 'To get started' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export { NeuralBackground, Navbar, FloatingCard, Hero };
