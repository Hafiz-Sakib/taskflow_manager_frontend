import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Kanban, CalendarDays, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LogoWordmark } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const FEATURES = [
  {
    icon: Kanban,
    title: 'Boards that flex to your workflow',
    desc: 'Custom columns, drag-and-drop, archive, and quick-add — built for how your team actually works.',
  },
  {
    icon: CalendarDays,
    title: 'Never miss a deadline',
    desc: "A real calendar view plus a daily Today list surfaces what's due and what's overdue.",
  },
  {
    icon: BarChart3,
    title: 'See progress at a glance',
    desc: 'Dashboard analytics, per-board stats, and completion rates computed straight from your data.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <LogoWordmark />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-semibold text-ink-600 dark:text-ink-300">
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mx-auto"
        >
          Manage work, <span className="bg-brand-gradient bg-clip-text text-transparent">your way.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 text-lg text-ink-500 max-w-xl mx-auto"
        >
          Boards, tasks, calendar, and analytics in one fast, focused app — no clutter, no learning curve.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link to="/register">
            <Button size="lg">Start for free</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </motion.div>

        <div className="mt-24 grid sm:grid-cols-3 gap-6 text-left">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-6"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold mb-1.5">{title}</h3>
              <p className="text-sm text-ink-400">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-ink-400">
          {['Free to use', 'No credit card', 'Dark mode included'].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" /> {item}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
