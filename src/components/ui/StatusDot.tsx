const colors: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-accent-gold',
  neutral: 'bg-gray-400',
};

interface StatusDotProps {
  status: keyof typeof colors;
  label?: string;
  className?: string;
}

export function StatusDot({ status, label, className = '' }: StatusDotProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </span>
  );
}
