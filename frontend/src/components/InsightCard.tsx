import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface InsightCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  color?: 'green' | 'red' | 'blue' | 'purple' | 'yellow' | 'default';
  index?: number;
}

const colorClasses = {
  green: 'from-accent-green/20 to-accent-green/5 border-accent-green/20',
  red: 'from-accent-red/20 to-accent-red/5 border-accent-red/20',
  blue: 'from-accent-blue/20 to-accent-blue/5 border-accent-blue/20',
  purple: 'from-accent-purple/20 to-accent-purple/5 border-accent-purple/20',
  yellow: 'from-accent-yellow/20 to-accent-yellow/5 border-accent-yellow/20',
  default: 'from-dark-800/50 to-dark-900/50 border-dark-700/50',
};

const iconColorClasses = {
  green: 'text-accent-green bg-accent-green/20',
  red: 'text-accent-red bg-accent-red/20',
  blue: 'text-accent-blue bg-accent-blue/20',
  purple: 'text-accent-purple bg-accent-purple/20',
  yellow: 'text-accent-yellow bg-accent-yellow/20',
  default: 'text-dark-300 bg-dark-700/50',
};

export default function InsightCard({
  title,
  value,
  subtitle,
  icon,
  color = 'default',
  index = 0,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-5 rounded-2xl bg-gradient-to-br border backdrop-blur-sm ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <p className="text-sm text-dark-400 mb-1">{title}</p>
      <p className="text-2xl font-bold font-mono text-dark-100">{value}</p>
      {subtitle && (
        <p className={`text-xs mt-1 ${
          subtitle.startsWith('+') ? 'text-accent-green' : 
          subtitle.startsWith('-') ? 'text-accent-red' : 'text-dark-500'
        }`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
