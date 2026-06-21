import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-blue text-white hover:bg-brand-blue-light shadow-glow-blue/40 hover:shadow-glow-blue',
  secondary: 'bg-bg-tertiary text-white border border-border-primary hover:border-brand-blue/40',
  ghost: 'text-text-secondary hover:text-white hover:bg-bg-tertiary',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
  gradient: 'bg-gradient-to-r from-brand-blue to-brand-cyan text-white shadow-glow-blue/40 hover:shadow-glow-cyan',
  outline: 'bg-transparent text-brand-blue-light border border-brand-blue/40 hover:bg-brand-blue/10',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon: Icon, className = '', ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </motion.button>
  );
}
