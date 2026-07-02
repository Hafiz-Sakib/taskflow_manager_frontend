import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50 dark:bg-ink-950 p-6 text-center">
      <div className="rounded-2xl bg-brand-500/10 p-4 text-brand-500">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-sm text-ink-400 max-w-sm">This page doesn't exist, or you don't have access to it.</p>
      <Link to="/">
        <Button>Back to safety</Button>
      </Link>
    </div>
  );
}
