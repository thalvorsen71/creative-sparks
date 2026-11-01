import corpus from '../corpus/corpus.json';
import { Label, SectionHead } from './ui.jsx';

const POS = { lead: 'Right at the top. Good.', early: 'Early, but not first.', buried: 'Buried.' };

export default function BuriedLede({ report }) {
  const b = report.buriedLede;
  const tentative = b?.confidence === 'tentative';
  const loc = corpus?.proofLocation;
  const total = report.stats?.sentences;
  const sentence = b && report.sentences?.[b.sentenceIndex];
  const before = sentence && report.sentences.slice(0, b.sentenceIndex).some((s) => s.cliches?.length);
  const where = b && `Sentence ${b.sentenceIndex + 1}${total ? ` of ${total}` : ''}${b.sentenceIndex > 0 && before ? ', after a cliché' : ''}`;

  return (
    <div>
      <SectionHead kicker="The Buried Lede" title={b ? (tentative ? 'A candidate, not a verdict' : 'The one thing only you could say') : 'We could not find something only you could say.'}>
        {b ? null : `We looked for something only you could say. We did not find it on this page.${['breathing', 'unmistakable'].includes(report.band?.id) ? ' Your detail may be everywhere, which is also an answer.' : ''}`}
      </SectionHead>
      {b && (
        <div className="grid gap-6 md:grid-cols-[1fr,16rem]">
          <div>
            <p className={tentative ? 'font-display text-2xl leading-snug' : 'font-display text-4xl leading-tight sm:text-5xl'}>{b.detail}</p>
            {tentative && <p className="mt-3 font-semibold">We are not sure about this one. You will know in two seconds whether it is right.</p>}
            <p className="mt-4 max-w-xl text-smoke">{b.why}</p>
          </div>
          <div className="self-start border-t border-ink pt-3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <Label>Where it sits</Label>
            <p className="mt-1 font-mono text-sm">{where}</p>
            <p className="mt-1 text-sm text-smoke">{POS[b.position] || ''}</p>
          </div>
        </div>
      )}
      {loc?.total > 0 && (
        <p className="mt-8 border-l-4 border-blood pl-4 text-lg">
          Of {loc.total} concrete details our readers found across {corpus?.meta?.schools} schools, <span className="font-semibold">{loc.homepage}</span> were on a homepage. The rest were one or two clicks down.
        </p>
      )}
    </div>
  );
}
