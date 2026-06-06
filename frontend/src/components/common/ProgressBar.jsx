import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function ProgressBar({ value, max = 100, label, showLabel = true, variant = 'default', size = 'md' }) {
  const percentage = (value / max) * 100;

  const variants = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    error: 'bg-red-600',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm text-slate-600">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-slate-200 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={clsx('h-full rounded-full transition-all duration-300', variants[variant])}
        />
      </div>
    </div>
  );
}
