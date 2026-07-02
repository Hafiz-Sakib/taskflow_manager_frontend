import type { ReactNode } from 'react';

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-500 mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-400 mt-1.5">{hint}</p>}
      {error && (
        <p className="text-xs text-danger mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
