import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../common/Card';
import clsx from 'clsx';

export default function DashboardCard({
  icon: Icon,
  title,
  value,
  subtext,
  trend,
  color = 'blue',
  onClick,
}) {
  const colorVariants = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-900' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-900' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-900' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-900' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-900' },
  };

  const variant = colorVariants[color];

  return (
    <motion.div whileHover={{ y: -4 }} onClick={onClick} className="cursor-pointer">
      <Card glass={false}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={clsx('p-3 rounded-lg', variant.bg)}>
              <Icon size={24} className={variant.icon} />
            </div>
            {trend && (
              <div className={clsx('flex items-center gap-1 text-sm font-semibold', trend > 0 ? 'text-green-600' : 'text-red-600')}>
                {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>

          <h3 className="text-slate-600 text-sm font-medium mb-1">{title}</h3>
          <p className={clsx('text-3xl font-bold mb-2', variant.text)}>{value}</p>
          {subtext && <p className="text-slate-500 text-xs">{subtext}</p>}
        </div>
      </Card>
    </motion.div>
  );
}
