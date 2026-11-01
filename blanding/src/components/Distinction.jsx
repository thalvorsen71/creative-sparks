import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { checkDistinction } from '../engine/index.js';
import { Label, SectionHead, focusRing } from './ui.jsx';

export default function Distinction({ schoolName }) {
  const [claims, setClaims] = useState(['', '', '']);
  const results = useMemo(
    () => claims.map((c) => (c.trim() ? checkDistinction(c, { schoolName }) : null)),
    [claims, schoolName],
  );
  const allPass = results.every((r) => r && r.passes);

  return (
    <section className="mt-24">
      <SectionHead kicker="The exercise" title="Three Things Only You Can Say">
        Type three claims about your school that a rival could not copy. Each is checked as you type.
      </SectionHead>
      <div className="grid gap-5">
        {claims.map((c, i) => {
          const r = results[i];
          return (
            <div key={i} className="grid gap-2 md:grid-cols-[1fr,18rem] md:gap-6">
              <label className="block">
                <Label>Claim {i + 1}</Label>
                <textarea rows={2} value={c} onChange={(e) => setClaims(claims.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder="Something only we can say, with a name, a number, or a place."
                  className={`mt-1 w-full rounded-none border border-ink bg-paper px-3 py-2 text-base placeholder:text-smoke/70 ${focusRing}`} />
              </label>
              <div aria-live="polite" className="min-h-[3rem] text-sm">
                {r && (
                  <>
                    <p className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest ${r.passes ? 'text-formaldehyde' : 'text-blood'}`}>
                      {r.passes ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}
                      {r.passes ? 'Passes' : 'Fails'}: {r.score}/100
                    </p>
                    <ul className="mt-1 grid gap-0.5 text-smoke">
                      {r.reasons.map((x, k) => <li key={k}>{x}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {allPass && (
        <div className="mt-6 border-2 border-formaldehyde bg-bone p-5" role="status">
          <p className="font-display text-2xl">Now ladder up. Your platform is somewhere above these three.</p>
        </div>
      )}
      <div className="mt-6 max-w-2xl text-sm text-smoke">
        <p>
          Laddering: take each claim and ask "why does this matter?" Then ask it again of the answer. Five times.
          The fifth answer is the platform. The first three claims are the proof it stands on.
        </p>
      </div>
    </section>
  );
}
