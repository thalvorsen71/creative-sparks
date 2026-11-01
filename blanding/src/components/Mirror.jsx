import corpus from '../corpus/corpus.json';
import { Label, SectionHead } from './ui.jsx';

const NONE_TITLE = {
  proof_first: 'You did not lead with a promise. You led with proof.',
  no_promise: 'We could not find a lead promise on this page.',
  unclassified: 'We found a promise but could not match it to a common theme. That may be a good sign.',
};
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
  const reason = lead.reason;
  const top = [...(corpus?.themes || [])].sort((a, b) => b.share - a.share)[0];
  const lc = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);
  const none = !lead.label && (lead.confidence === 'none' || reason);
  const pct = lead.corpusShare != null ? Math.round(lead.corpusShare * 100) : null;
  const ex = (lead.examples || []).slice(0, 3);

  return (
    <div>
      <SectionHead kicker="The Mirror" title={none ? NONE_TITLE[reason] || NONE_TITLE.no_promise : `You lead with ${lc(lead.label)}.`}>
        {reason === 'proof_first' && top
          ? `Most schools do the opposite: ${Math.round(top.share * 100)}% of the ${schools} we read lead with ${lc(top.label)}.`
          : lead.confidence === 'weak' && !none ? 'A weak read. Treat it as a hunch, not a verdict.' : null}
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
      <p className="mt-6 text-sm text-smoke">
        From adeo's Blanding research: {schools} higher ed sites read by two independent AI readers.
      </p>
    </div>
  );
}
