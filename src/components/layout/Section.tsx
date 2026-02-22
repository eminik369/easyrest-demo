import type { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, subtitle, children, className = '' }: SectionProps) {
  return (
    <section className={`mb-16 ${className}`}>
      {title && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-gray-500">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
