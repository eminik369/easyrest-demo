import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, color = 'bg-accent-gold', className = '', showLabel = false }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 text-right">{pct.toFixed(0)}%</p>
      )}
    </div>
  );
}
