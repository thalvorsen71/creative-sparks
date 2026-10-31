import { useState } from 'react';
import { SectionHead, focusRing } from './ui.jsx';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function LogoSwap({ report, schoolName }) {
  const [on, setOn] = useState(true);
  const { swapName, survivors, total } = report.logoSwap;
  const alive = new Set(survivors);
  const re = swapName ? new RegExp(`(${esc(swapName)})`, 'g') : null;

  const render = (sent) => {
    if (!on) return sent.text;
    const text = sent.swapped ?? sent.text;
    if (!re) return text;
    return text.split(re).map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="mx-0.5 inline-block -rotate-1 border-2 border-blood bg-paper px-1.5 font-mono text-sm font-semibold uppercase tracking-wide text-blood">
          {swapName}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div>
      <SectionHead n={4} title="The Logo Swap">
        Replace your name with a stranger's. If the sentence still works, it was never yours.
      </SectionHead>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)}
          className={`flex items-center gap-3 rounded-none border border-ink px-3 py-2 font-mono text-xs uppercase tracking-widest ${focusRing}`}>
          <span className={`relative h-5 w-10 border border-ink ${on ? 'bg-blood' : 'bg-paper'}`} aria-hidden>
            <span className={`absolute top-0.5 h-3.5 w-3.5 bg-ink transition-all ${on ? 'left-5' : 'left-0.5'}`} />
          </span>
          Swap {on ? 'on' : 'off'}
        </button>
        <p className="font-display text-2xl">
          {survivors.length} of {total} sentences survive the swap.
        </p>
      </div>
      <ol className="mt-6 grid gap-3">
        {report.sentences.map((s) => {
          const grey = on && alive.has(s.i);
          return (
            <li key={s.i} className="grid gap-1 sm:grid-cols-[1fr,10rem] sm:gap-6">
              <p className={`text-lg leading-relaxed ${grey ? 'text-smoke/60' : ''}`}>{render(s)}</p>
              {grey && <p className="font-mono text-[11px] uppercase tracking-widest text-blood sm:pt-2">Could be anyone's.</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
