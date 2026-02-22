import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="mb-10">
      {badge && <div className="mb-4">{badge}</div>}
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-lg text-gray-500 max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
