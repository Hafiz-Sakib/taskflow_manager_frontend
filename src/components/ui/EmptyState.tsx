import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && <div className="mb-4 text-brand-400">{icon}</div>}
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-400 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}
