import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Sparkline from './Sparkline';
import { formatCurrency, formatPercent, formatRelativeTime, formatChange } from '../utils/format';
import type { ItemSummary } from '../types';

interface ItemCardProps {
  item: ItemSummary;
  index: number;
}

export default function ItemCard({ item, index }: ItemCardProps) {
  const navigate = useNavigate();
  const isAsset = item.type === 'asset';
  
  const isPositiveChange = isAsset 
    ? item.change_amount >= 0 
    : item.change_amount <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/item/${item.id}`)}
      className="flex items-center gap-4 p-4 bg-dark-900/50 hover:bg-dark-800/50 rounded-xl cursor-pointer transition-all group"
    >
      {/* Sparkline */}
      <div className="flex-shrink-0">
        <Sparkline data={item.sparkline} color="auto" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-dark-100 truncate">{item.name}</h3>
        <p className="text-xs text-dark-500">
          Updated {formatRelativeTime(item.last_updated)}
        </p>
      </div>

      {/* Value & Change */}
      <div className="flex-shrink-0 text-right">
        <p className="font-semibold font-mono text-dark-100">
          {formatCurrency(item.current_value, item.currency, true)}
        </p>
        <p
          className={`text-xs font-medium ${
            isPositiveChange ? 'text-accent-green' : 'text-accent-red'
          }`}
        >
          {formatPercent(item.change_percent)} {formatChange(item.change_amount, item.currency)}
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight 
        size={18} 
        className="text-dark-600 group-hover:text-dark-400 transition-colors flex-shrink-0" 
      />
    </motion.div>
  );
}
