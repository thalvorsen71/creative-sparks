import { Skull } from 'lucide-react';
import { SectionHead } from './ui.jsx';

export default function HitList({ report }) {
  const list = report.cliches;
  return (
    <div>
      <SectionHead n={5} title="Cliché Hit List">Sorted by how often you used them. Skulls show how terminal each one is.</SectionHead>
      {list.length === 0 ? (
        <p className="border border-ink p-4">No clichés found. Suspicious, but we will allow it.</p>
      ) : (
        <ul className="grid gap-px border border-ink bg-ink md:grid-cols-2">
          {list.map((c) => (
            <li key={c.id} className="bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-2xl leading-tight">{c.phrase}</p>
                <span className="flex shrink-0 gap-0.5 text-blood" role="img" aria-label={`Severity ${c.severity} of 3`}>
                  {[1, 2, 3].map((n) => (
                    <Skull key={n} size={18} aria-hidden className={n <= c.severity ? '' : 'opacity-20'} />
                  ))}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-smoke">Found {c.count}x</p>
              <p className="mt-3 text-sm"><span className="font-semibold">What it actually says:</span> {c.translation}</p>
              <p className="mt-1 text-sm"><span className="font-semibold">The fix:</span> {c.fix}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
