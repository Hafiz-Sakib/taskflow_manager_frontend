import { cn } from '@/utils/cn';

const sizeMap = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-14 w-14',
};

export function Logo({ size = 'md', className }: { size?: keyof typeof sizeMap; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn(sizeMap[size], className)} aria-hidden="true">
      <defs>
        <linearGradient id="taskflow-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6d5dfc" />
          <stop offset="100%" stopColor="#ef5da8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill="url(#taskflow-logo-gradient)" />
      <path
        d="M13 25.5 L21 32 L36 15.5"
        fill="none"
        stroke="white"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Logo size="sm" />
      <span className="font-bold text-lg">TaskFlow</span>
    </div>
  );
}
