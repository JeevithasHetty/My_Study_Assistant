import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  ...props
}) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center gap-2 justify-center';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:bg-slate-50',
    ghost: 'text-blue-600 hover:bg-blue-50 disabled:text-blue-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
      onClick={onClick}
    >
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {children}
    </motion.button>
  );
}
