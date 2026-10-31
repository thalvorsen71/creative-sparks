import { Label, SectionHead } from './ui.jsx';

const BARS = [
  ['cliche', 'Clichés', 'How little boilerplate you lean on'],
  ['specificity', 'Specificity', 'Names, numbers, places, dates'],
  ['proof', 'Proof', 'Promises that come with evidence'],
  ['swap', 'Swap test', 'Sentences that are actually yours'],
];
const BAND_LABELS = ['Embalmed', 'Haunted', 'Twitching', 'Breathing', 'Unmistakable'];

export default function Score({ report }) {
  const { score, band, subscores, stats } = report;
  return (
    <div>
      <SectionHead n={1} title="The Distinction Score" />
      <div className="grid gap-8 md:grid-cols-[auto,1fr] md:gap-12">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[8rem] leading-[0.8] text-blood sm:text-[10rem]" aria-label={`Score ${score} out of 100`}>{score}</span>
            <span className="font-mono text-sm text-smoke">/100</span>
          </div>
          <p className="mt-4 font-display text-3xl">{band.label}</p>
          <p className="mt-1 max-w-xs text-smoke">{band.verdict}</p>
        </div>
        <div className="min-w-0 self-end">
          <div className="relative mt-8 h-3 border border-ink">
            {[30, 50, 65, 80].map((t) => (
              <span key={t} className="absolute top-0 h-full w-px bg-ink" style={{ left: `${t}%` }} aria-hidden />
            ))}
            <span className="absolute -top-2 h-7 w-1 -translate-x-1/2 bg-blood" style={{ left: `${Math.min(100, Math.max(0, score))}%` }} aria-hidden />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] uppercase tracking-widest text-smoke">
            <span>{BAND_LABELS[0]}</span><span>{BAND_LABELS[4]}</span>
          </div>
          <p className="mt-3 text-sm text-smoke">Median across 300+ audited institutions: about 50.</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-smoke">
            {stats.words} words / {stats.sentences} sentences / {stats.clicheHits} cliché hits
          </p>
        </div>
      </div>
      <dl className="mt-10 grid gap-5 sm:grid-cols-2">
        {BARS.map(([k, name, hint]) => (
          <div key={k}>
            <div className="flex items-baseline justify-between">
              <dt className="font-mono text-xs uppercase tracking-widest">{name}</dt>
              <dd className="font-mono text-sm">{subscores[k]}</dd>
            </div>
            <div className="mt-1 h-2 border border-ink" role="img" aria-label={`${name} ${subscores[k]} of 100`}>
              <div className="h-full bg-ink" style={{ width: `${subscores[k]}%` }} />
            </div>
            <Label className="mt-1 normal-case tracking-normal">{hint}</Label>
          </div>
        ))}
      </dl>
    </div>
  );
}
