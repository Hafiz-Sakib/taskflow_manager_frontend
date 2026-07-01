export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="h-8 w-8 rounded-full border-[3px] border-ink-100 dark:border-ink-800 border-t-brand-500 animate-spin" />
    </div>
  );
}
