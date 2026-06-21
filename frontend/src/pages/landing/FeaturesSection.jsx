import { motion } from 'framer-motion';
import {
  FileText, BookOpen, CalendarDays, Target, StickyNote,
  BarChart3, Video, CheckSquare, BookMarked,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    title: 'Resume Analyzer',
    desc: 'Upload your resume and get an instant ATS score, skill gap detection, and job-description matching against real listings.',
    color: 'blue',
  },
  {
    icon: BookOpen,
    title: 'Document Tutor',
    desc: 'Upload any PDF — lecture notes, textbooks, papers — and get summaries, flashcards, MCQs, and a Q&A assistant.',
    color: 'cyan',
  },
  {
    icon: CalendarDays,
    title: 'Smart Study Planner',
    desc: 'AI-generated daily and weekly study plans that adapt to your exams, syllabus size, and available hours.',
    color: 'green',
  },
  {
    icon: Target,
    title: 'Placement Readiness',
    desc: 'Track your readiness score against target companies with a clear roadmap of what to fix next.',
    color: 'purple',
  },
  {
    icon: StickyNote,
    title: 'AI Notes',
    desc: 'Rich-text notes with one-click AI: summarize, generate flashcards, MCQs, or interview questions from any note.',
    color: 'amber',
  },
  {
    icon: BarChart3,
    title: 'Unified Analytics',
    desc: 'Study hours, task completion, ATS trends, and exam progress in one dashboard — not five disconnected apps.',
    color: 'pink',
  },
];

const COLOR_MAP = {
  blue: { bg: 'bg-brand-blue/10', text: 'text-brand-blue-light', border: 'group-hover:border-brand-blue/40' },
  cyan: { bg: 'bg-brand-cyan/10', text: 'text-brand-cyan', border: 'group-hover:border-brand-cyan/40' },
  green: { bg: 'bg-brand-green/10', text: 'text-brand-green-light', border: 'group-hover:border-brand-green/40' },
  purple: { bg: 'bg-brand-purple/10', text: 'text-violet-300', border: 'group-hover:border-brand-purple/40' },
  amber: { bg: 'bg-brand-amber/10', text: 'text-brand-amber', border: 'group-hover:border-brand-amber/40' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'group-hover:border-pink-500/40' },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-6 lg:px-10 bg-bg-primary">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-brand-cyan text-sm font-semibold tracking-wide uppercase">Everything in one place</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-4">
            One platform. Every part of your academic life.
          </h2>
          <p className="text-text-secondary">
            Stop juggling five different tools. StudentOS AI brings study, resume, placement,
            and career guidance into a single connected system.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const c = COLOR_MAP[f.color];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`group bg-bg-card border border-border-primary rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${c.border}`}
              >
                <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                  <f.icon size={20} className={c.text} />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
