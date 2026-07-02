import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function Drawer({
  open,
  onClose,
  side = 'left',
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: side === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'left' ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            className={`absolute inset-y-0 ${side === 'left' ? 'left-0' : 'right-0'}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
