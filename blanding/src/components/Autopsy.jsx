import { useState } from 'react';
import corpus from '../corpus/corpus.json';
import { Label, SectionHead, focusRing } from './ui.jsx';

function Tag({ children, blood }) {
  return (
    <span className={`mr-2 inline-block border px-1.5 py-px align-middle font-mono text-[10px] uppercase tracking-widest ${blood ? 'border-blood bg-blood text-paper' : 'border-ink text-ink'}`}>
      {children}
    </span>
  );
}

export default function Autopsy({ report }) {
  const [open, setOpen] = useState(null);
  const byId = Object.fromEntries(report.cliches.map((c) => [c.id, c]));
  const kinds = Object.fromEntries((report.promises || []).map((p) => [p.sentenceIndex, p.proofKind]));
  const KIND = { restated_claim: 'Restates the claim', operating_mechanism: 'A real mechanism', reported_outcome: 'An outcome',
    published_policy: 'A published policy', example_or_story: 'An example', third_party_recognition: 'Third-party recognition', none: 'None' };
  const restated = (corpus?.proofKinds || []).find((k) => k.kind === 'restated_claim');
  const orphans = new Set(report.promiseProof.orphans);

  return (
    <div>
      <SectionHead n={3} title="The Autopsy">
        Your copy, one sentence at a time. Red marks are clichés. Press one to see what it actually says.
      </SectionHead>
      {restated?.share > 0 && (
        <p className="-mt-2 mb-6 border-l-4 border-blood pl-4 text-sm">
          Across the schools we read, about 1 in {Math.round(1 / restated.share)} pieces of 'evidence' just restated the claim.
        </p>
      )}
      <ol className="grid gap-5">
        {report.sentences.map((s) => {
          const parts = [];
          let at = 0;
          [...s.cliches].sort((a, b) => a.start - b.start).forEach((c) => {
            if (c.start < at) return;
            if (c.start > at) parts.push({ t: s.text.slice(at, c.start) });
            parts.push({ t: s.text.slice(c.start, c.end), c });
            at = c.end;
          });
          if (at < s.text.length) parts.push({ t: s.text.slice(at) });
          const orphan = orphans.has(s.i);
          const key = (c) => `${s.i}-${c.start}`;
          const active = s.cliches.find((c) => key(c) === open);
          const info = active && byId[active.id];
          return (
            <li key={s.i} className="grid grid-cols-[2rem,1fr] gap-3 border-b border-ink/15 pb-5">
              <span className="pt-1 font-mono text-[11px] text-smoke">{String(s.i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <p className="text-lg leading-relaxed">
                  {orphan ? <Tag blood>Orphaned promise</Tag> : s.isPromise && <Tag>Promise</Tag>}
                  {s.isProof && <Tag>Proof</Tag>}
                  {kinds[s.i] && <Tag>Proof: {KIND[kinds[s.i]] || kinds[s.i]}</Tag>}
                  {parts.map((p, k) =>
                    p.c ? (
                      <button key={k} type="button" aria-expanded={open === key(p.c)}
                        onClick={() => setOpen(open === key(p.c) ? null : key(p.c))}
                        className={`rounded-none border-b-2 border-blood px-0.5 text-left font-medium ${focusRing} ${open === key(p.c) ? 'bg-blood text-paper' : 'bg-blood/15 hover:bg-blood/30'}`}>
                        {p.t}
                      </button>
                    ) : (
                      <span key={k}>{p.t}</span>
                    ),
                  )}
                </p>
                {info && (
                  <div className="mt-3 border-l-4 border-blood bg-bone p-4" role="region" aria-label={`About ${info.phrase}`}>
                    <Label>Cliché: {info.phrase}</Label>
                    <p className="mt-2"><span className="font-semibold">What it actually says:</span> {info.translation}</p>
                    <p className="mt-1"><span className="font-semibold">The fix:</span> {info.fix}</p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
