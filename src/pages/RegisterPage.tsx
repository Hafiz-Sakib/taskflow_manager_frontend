import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50 dark:bg-ink-950">
      <div className="hidden lg:flex flex-col justify-between bg-brand-gradient p-12 text-white">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur" />
          <span className="text-lg font-bold">TaskFlow</span>
        </Link>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-3xl font-bold leading-snug max-w-md">One home for every board, task, and deadline.</h2>
          <p className="text-white/70 mt-3 max-w-sm">Create your first board in seconds and start organizing today.</p>
        </motion.div>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} TaskFlow</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden h-10 w-10 rounded-xl bg-brand-gradient mb-8" />
          <h1 className="text-2xl font-bold mb-1">Create account</h1>
          <p className="text-ink-400 mb-8">Set up TaskFlow to organize your work.</p>

          <RegisterForm />

          <p className="text-sm text-ink-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
