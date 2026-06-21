import { motion } from 'framer-motion';

export default function Card({ children, className = '', glow = false, hover = true, onClick, ...props }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2 } : {}}
      className={`
        bg-bg-card border border-border-primary rounded-2xl p-5
        transition-all duration-200
        ${hover ? 'hover:border-brand-blue/30 hover:shadow-card-hover' : ''}
        ${glow ? 'shadow-glow-blue/10' : 'shadow-card'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
