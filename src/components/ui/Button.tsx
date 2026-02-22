import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const variants = {
  primary: 'bg-accent-gold text-white hover:bg-accent-gold-dark',
  secondary: 'border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white',
  ghost: 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
};
const sizes = { sm: 'px-4 py-1.5 text-sm', md: 'px-6 py-2.5 text-base', lg: 'px-8 py-3 text-lg' };

export function Button({ variant = 'primary', size = 'md', children, onClick, className = '', disabled }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl font-medium transition-colors duration-200 cursor-pointer ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
