import { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Label, focusRing } from './ui.jsx';

const field = `w-full rounded-none border border-ink bg-paper px-3 py-2 text-base text-ink placeholder:text-smoke/70 ${focusRing}`;

export default function Intake({ schoolName, setSchoolName, text, setText, rivals, setRivals, onRun, onSample }) {
  const [open, setOpen] = useState(false);
  const setRival = (i, k, v) => setRivals(rivals.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const canRun = text.trim().length > 0;

  return (
    <section aria-labelledby="intake-h" className="border-t-2 border-ink pt-4">
      <Label>Intake</Label>
      <h2 id="intake-h" className="sr-only">Submit copy</h2>
      <div className="mt-3 grid gap-4">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-widest">School name</span>
          <input className={`${field} mt-1`} value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Northfield University" autoComplete="off" />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-widest">The copy</span>
          <textarea className={`${field} mt-1 min-h-[14rem] leading-relaxed`} value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your homepage, about page, or viewbook copy here." />
        </label>

        <div className="border border-ink/40">
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
            className={`flex w-full items-center justify-between px-3 py-2 text-left font-mono text-xs uppercase tracking-widest ${focusRing}`}>
            <span>Rival Séance (optional)</span>
            <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {open && (
            <div className="grid gap-4 border-t border-ink/40 p-3">
              <p className="text-sm text-smoke">Add up to three rivals. We will count the phrases you share.</p>
              {rivals.map((r, i) => (
                <div key={i} className="grid gap-2 border border-ink/30 p-3">
                  <div className="flex items-center justify-between">
                    <Label>Rival {i + 1}</Label>
                    <button type="button" aria-label={`Remove rival ${i + 1}`}
                      onClick={() => setRivals(rivals.filter((_, j) => j !== i))} className={`p-1 ${focusRing}`}>
                      <X size={16} aria-hidden />
                    </button>
                  </div>
                  <input className={field} value={r.name} onChange={(e) => setRival(i, 'name', e.target.value)}
                    placeholder="Rival name" aria-label={`Rival ${i + 1} name`} />
                  <textarea className={`${field} min-h-[7rem]`} value={r.text}
                    onChange={(e) => setRival(i, 'text', e.target.value)}
                    placeholder="Their copy" aria-label={`Rival ${i + 1} copy`} />
                </div>
              ))}
              {rivals.length < 3 && (
                <button type="button" onClick={() => setRivals([...rivals, { name: '', text: '' }])}
                  className={`flex w-fit items-center gap-2 border border-ink px-3 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper ${focusRing}`}>
                  <Plus size={14} aria-hidden /> Add a rival
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onRun} disabled={!canRun}
            className={`rounded-none bg-blood px-6 py-3 font-display text-xl text-paper hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}>
            Run the autopsy
          </button>
          <button type="button" onClick={() => onSample('generic')}
            className={`rounded-none border border-ink px-4 py-3 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper ${focusRing}`}>
            Try a bland one
          </button>
          <button type="button" onClick={() => onSample('specific')}
            className={`rounded-none border border-ink px-4 py-3 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper ${focusRing}`}>
            Try a good one
          </button>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-smoke">Cmd or Ctrl + Enter also runs it.</p>
      </div>
    </section>
  );
}
