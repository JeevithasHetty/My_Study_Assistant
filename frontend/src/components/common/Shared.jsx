import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';

export function Badge({ children, color = 'blue', className = '' }) {
  const colors = {
    blue: 'bg-brand-blue/15 text-brand-blue-light border-brand-blue/30',
    cyan: 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30',
    green: 'bg-brand-green/15 text-brand-green-light border-brand-green/30',
    amber: 'bg-brand-amber/15 text-brand-amber border-brand-amber/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    purple: 'bg-brand-purple/15 text-violet-300 border-brand-purple/30',
    gray: 'bg-bg-tertiary text-text-secondary border-border-primary',
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function Spinner({ size = 24, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-brand-blue ${className}`} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-text-muted text-sm">Loading StudentOS AI...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-bg-tertiary border border-border-primary flex items-center justify-center mb-4">
        <Icon size={24} className="text-text-muted" />
      </div>
      <p className="text-white font-medium mb-1">{title}</p>
      {description && <p className="text-text-secondary text-sm max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function ProgressBar({ value = 0, max = 100, color = 'blue', className = '', height = 'h-2' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const gradients = {
    blue: 'from-brand-blue to-brand-cyan',
    green: 'from-brand-green to-brand-cyan',
    amber: 'from-brand-amber to-red-400',
    purple: 'from-brand-purple to-brand-blue',
  };
  return (
    <div className={`progress-dark ${height} ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${gradients[color]}`}
      />
    </div>
  );
}

export function StatPill({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'text-brand-blue-light bg-brand-blue/10',
    cyan: 'text-brand-cyan bg-brand-cyan/10',
    green: 'text-brand-green-light bg-brand-green/10',
    amber: 'text-brand-amber bg-brand-amber/10',
    purple: 'text-violet-300 bg-brand-purple/10',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}
