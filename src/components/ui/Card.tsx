import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: 'p-0', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({ children, className = '', onClick, hoverable = false, padding = 'md' }: CardProps) {
  const hasCustomBg = className.includes('bg-');
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' } : undefined}
      className={`${hasCustomBg ? '' : 'bg-white border-gray-300/50'} rounded-2xl border shadow-sm ${paddings[padding]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
