interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'development' | 'gold' | 'default';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const variants: Record<string, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
  gold: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
  default: 'bg-gray-100 text-gray-500 border-gray-200',
  development: 'bg-gray-100 text-gray-500 border-gray-300 border-dashed',
};

const sizes: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
};

export function Badge({ variant = 'info', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
