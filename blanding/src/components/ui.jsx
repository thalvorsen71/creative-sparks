import { motion, useReducedMotion } from 'framer-motion';

export function Label({ children, className = '' }) {
  return <p className={`font-mono text-[11px] uppercase tracking-[0.18em] text-smoke ${className}`}>{children}</p>;
}

export function SectionHead({ n, kicker, title, children }) {
  return (
    <header className="mb-6 border-t-2 border-ink pt-4">
      <Label>{kicker || `SPECIMEN ${String(n).padStart(2, '0')}`}</Label>
      <h2 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
      {children && <p className="mt-2 max-w-2xl text-sm text-smoke">{children}</p>}
    </header>
  );
}

export function Reveal({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: reduce ? 0 : delay, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blood';
