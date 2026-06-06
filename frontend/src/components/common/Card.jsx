import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Card({
  children,
  className,
  hover = true,
  animated = true,
  glass = false,
  ...props
}) {
  const baseStyles = clsx(
    'rounded-lg border',
    glass ? 'bg-white/70 backdrop-blur-md border-white/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm',
    hover && 'hover:shadow-md transition-shadow duration-200',
  );

  const motionProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <motion.div className={clsx(baseStyles, className)} {...motionProps} {...props}>
      {children}
    </motion.div>
  );
}
