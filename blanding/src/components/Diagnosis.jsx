import { Label } from './ui.jsx';

export default function Diagnosis({ report }) {
  const { score, band, diagnosis } = report;
  const line = diagnosis?.line || [diagnosis?.title, diagnosis?.tagline].filter(Boolean).join('. ');
  return (
    <div className="border-t-2 border-ink pt-4">
      <Label>The Diagnosis</Label>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr,14rem] lg:gap-12">
        <p className="font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">{line}</p>
        <div className="self-start border-t border-ink pt-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <Label>Distinction Score</Label>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-7xl leading-none text-blood" aria-label={`Score ${score} out of 100`}>{score}</span>
            <span className="font-mono text-xs text-smoke">/100</span>
          </p>
          <p className="mt-2 font-display text-2xl">{band.label}</p>
          <p className="mt-1 text-sm text-smoke">{band.verdict}</p>
        </div>
      </div>
    </div>
  );
}
