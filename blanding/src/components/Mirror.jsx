import corpus from '../corpus/corpus.json';
import { Label, SectionHead } from './ui.jsx';

const NAMES = ['Another school', 'Another school', 'Yet another school'];

function Quote({ who, text, mine }) {
  return (
    <figure className={`flex flex-col justify-between p-4 ${mine ? 'border-2 border-blood bg-paper' : 'border border-ink/40 bg-bone'}`}>
      <blockquote className="font-display text-xl leading-snug">&ldquo;{text}&rdquo;</blockquote>
      <figcaption className={`mt-4 font-mono text-[11px] uppercase tracking-widest ${mine ? 'text-blood' : 'text-smoke'}`}>{who}</figcaption>
    </figure>
  );
}

export default function Mirror({ report }) {
  const lead = report.lead;
  if (!lead) return null;
  const schools = corpus?.meta?.schools;
  const none = lead.confidence === 'none' || !lead.label;
  const pct = lead.corpusShare != null ? Math.round(lead.corpusShare * 100) : null;
  const ex = (lead.examples || []).slice(0, 3);

  return (
    <div>
      <SectionHead kicker="The Mirror" title={none ? 'We could not find a lead promise.' : `You lead with ${lead.label}.`}>
        {none
          ? 'Nothing in this copy reads as a clear first promise. That is its own finding: a reader cannot repeat what you did not say.'
          : lead.confidence === 'weak' ? 'A weak read. Treat it as a hunch, not a verdict.' : null}
      </SectionHead>
      {!none && pct != null && (
        <p className="max-w-3xl font-display text-3xl leading-tight sm:text-4xl">
          <span className="text-blood">{pct}%</span> of the {schools} schools we read lead with the same promise.
        </p>
      )}
      {!none && lead.quote && (
        <div className="mt-8">
          <Label>Your lead, next to theirs</Label>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Quote who="You" text={lead.quote} mine />
            {ex.map((t, i) => <Quote key={i} who={NAMES[i]} text={t} />)}
          </div>
          {ex.length === 0 && <p className="mt-3 text-sm text-smoke">No quotes on file for this theme yet.</p>}
        </div>
      )}
      <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-smoke">
        From adeo's Blanding research: {schools} higher ed sites read by two independent AI readers.
      </p>
    </div>
  );
}
