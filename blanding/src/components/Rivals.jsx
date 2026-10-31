import { SectionHead } from './ui.jsx';

export default function Rivals({ report }) {
  return (
    <div>
      <SectionHead n={5} title="Rival Séance">
        You are not competing with them. You are harmonizing with them.
      </SectionHead>
      <ul className="grid gap-4 md:grid-cols-3">
        {report.rivals.map((r, i) => (
          <li key={i} className="border border-ink p-4">
            <p className="font-display text-2xl">{r.name || `Rival ${i + 1}`}</p>
            <div className="mt-3 flex gap-6 font-mono text-xs uppercase tracking-widest">
              <p>Score<br /><span className="font-display text-3xl normal-case tracking-normal">{r.score}</span></p>
              <p>Overlap<br /><span className="font-display text-3xl normal-case tracking-normal text-blood">{Math.round(r.overlap * 100)}%</span></p>
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-smoke">Phrases you share</p>
            {r.sharedPhrases.length ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {r.sharedPhrases.map((p) => (
                  <li key={p} className="border border-blood px-2 py-0.5 text-sm text-blood">{p}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm">None. You sound like yourselves.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
