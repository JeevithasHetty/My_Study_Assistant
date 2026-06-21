import { motion } from 'framer-motion';
import {
  FileText, Target, CalendarDays, GraduationCap,
  Video, FileSearch, Brain, ArrowRight,
} from 'lucide-react';

const AGENTS = [
  { icon: FileText, name: 'Resume Analyst', role: 'ATS analysis, skill gaps, job matching', color: 'text-brand-blue-light', bg: 'bg-brand-blue/10', border: 'border-brand-blue/30' },
  { icon: Target, name: 'Placement Mentor', role: 'Readiness scoring & improvement plans', color: 'text-violet-300', bg: 'bg-brand-purple/10', border: 'border-brand-purple/30' },
  { icon: CalendarDays, name: 'Study Planner', role: 'Daily & weekly plans, exam scheduling', color: 'text-brand-green-light', bg: 'bg-brand-green/10', border: 'border-brand-green/30' },
  { icon: GraduationCap, name: 'Learning Assistant', role: 'Concept explanation, practice questions', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/30' },
  { icon: Video, name: 'Resource Agent', role: 'Curated videos, docs, and courses', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { icon: FileSearch, name: 'Document Tutor', role: 'PDF understanding, summaries, Q&A', color: 'text-brand-amber', bg: 'bg-brand-amber/10', border: 'border-brand-amber/30' },
];

export default function AgentsSection() {
  return (
    <section id="agents" className="relative py-24 px-6 lg:px-10 bg-bg-secondary overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-brand-cyan text-sm font-semibold tracking-wide uppercase">Multi-agent architecture</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-4">
            Six specialists. One coach coordinating them all.
          </h2>
          <p className="text-text-secondary">
            Each agent focuses on one job and does it well. The Career Coach sits above
            them, synthesizing every insight into a single roadmap for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-6">
          {AGENTS.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`bg-bg-card border ${a.border} rounded-2xl p-5 hover:-translate-y-1 transition-transform`}
            >
              <div className={`w-10 h-10 rounded-lg ${a.bg} flex items-center justify-center mb-3`}>
                <a.icon size={18} className={a.color} />
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">{a.name}</h4>
              <p className="text-text-muted text-xs leading-relaxed">{a.role}</p>
            </motion.div>
          ))}
        </div>

        {/* Connector — visually ties the grid to the manager agent below */}
        <div className="flex justify-center mb-6">
          <div className="w-px h-10 bg-gradient-to-b from-border-primary to-brand-blue/40" />
        </div>

        {/* Career Coach — manager agent, centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto flex flex-col items-center"
        >
          <span className="bg-brand-blue text-white text-[10px] font-bold tracking-wide px-3 py-1 rounded-full mb-4">
            MANAGER AGENT
          </span>
          <div className="w-full bg-gradient-to-br from-brand-blue/15 to-brand-purple/10 border border-brand-blue/30 rounded-2xl p-6 text-center shadow-glow-blue/20">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center mx-auto mb-3">
              <Brain size={22} className="text-brand-blue-light" />
            </div>
            <h4 className="text-white font-bold mb-1">Career Coach</h4>
            <p className="text-text-secondary text-sm">
              Coordinates all six agents, aggregates their insights, and generates your
              weekly goals and long-term career roadmap.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
