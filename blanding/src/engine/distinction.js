// "Three things only you can say." Scores one claim, live, as the user types.
import { LEXICON, LEXICON_INDEX } from './lexicon.js';
import { words as wordList, nameRegex, hasContent } from './text.js';
import { findCliches, findSpecifics } from './detect.js';
import { findDetails } from './details.js';

const CALENDAR = /^(?:January|February|March|April|May|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?$/;
const DETAIL_REASON = {
  first: (d) => `Claims '${d.phrase}'. A first or an only: a rival would have to disprove it.`,
  structure: (d) => `Describes how learning works: '${d.detail}'. That is distinction.`,
  requirement: (d) => `Names something every student does: '${d.detail}'. Good.`,
  ritual: () => 'A ritual with a start date. Nobody can borrow that.',
  mechanism: (d) => `Describes something that actually happens: '${d.detail}'. Good.`,
  'named program': (d) => `Names a program: ${d.detail}. A program is proof the promise has a mechanism.`,
};

const SUPERLATIVE = /\b(?:best|finest|top|leading|premier|greatest|most \w+|world-class|renowned|unparalleled|excellent|exceptional|outstanding)\b/i;
const SOURCE = /\b(?:according to|ranked|survey|U\.S\. News|Princeton Review|Forbes|NSF|NIH|Fulbright|Rhodes|since \d{4}|in \d{4})\b/i;
const EXCLUSIVE = /\b(?:only|first(?![- ](?:year|generation|gen\b))|oldest|largest|smallest|last|sole|no other)\b/i;
const NUMBER = /\d/;

export function checkDistinction(claim = '', opts = {}) {
  const o = opts && typeof opts === 'object' ? opts : {};
  const text = typeof claim === 'string' ? claim.trim() : String(claim ?? '').trim();
  if (!hasContent(text)) {
    return { score: 0, passes: false, reasons: ['Nothing here yet.', 'Type one thing a rival could not say with a straight face.'] };
  }

  const nameRe = nameRegex(o.schoolName);
  const spec = findSpecifics(text, nameRe);
  const cliches = findCliches(text);
  const wc = wordList(text).length;
  const hasNumber = NUMBER.test(text.replace(nameRe || /$^/, ''));
  const names = spec.tokens.filter((t) => /[\p{Lu}]/u.test(t) && !/^\$?\d/.test(t) && !CALENDAR.test(t));
  // The strongest distinction is a mechanism, structure, requirement or first. Not a place name.
  const detail = findDetails(text.replace(nameRe || /$^/, ' '), spec).find((d) => d.w >= 2.5 && DETAIL_REASON[d.kind]);
  const mentionsSelf = nameRe ? nameRe.test(text) : false;
  if (nameRe) nameRe.lastIndex = 0;

  const good = [];
  const bad = [];
  let score = 35;

  if (hasNumber) { score += 22; good.push([3, 'Contains a number. Good.']); }
  // Do not count the same name twice: a named program already earned its credit as a detail.
  const otherNames = detail ? names.filter((nm) => !detail.detail.includes(nm)) : names;
  if (otherNames.length) { score += 20; good.push([3, `Names something real: ${otherNames[0]}. Good.`]); }
  if (SOURCE.test(text)) { score += 10; good.push([2, 'Points to a date or a source. Checkable.']); }
  if (detail) { score += 25; good.push([4, DETAIL_REASON[detail.kind](detail)]); }
  if (EXCLUSIVE.test(text) && (hasNumber || names.length) && !(detail && detail.kind === 'first')) {
    score += 10; good.push([2, 'A rival would have to disprove this. Good.']);
  }
  if (spec.concrete > 0) { score += 5; good.push([1, 'Mentions a physical thing. Readers can picture it.']); }
  if (wc >= 8 && wc <= 40) score += 3;

  for (const c of cliches.slice(0, 2)) {
    const sev = LEXICON[LEXICON_INDEX[c.id]].severity;
    score -= 8 + sev * 5;
    bad.push([3 + sev, `Contains '${c.match}'. Bad.`]);
  }
  if (!hasNumber && !names.length && !detail) {
    score -= 10;
    bad.push([5, mentionsSelf
      ? 'The only name in it is yours. Swap it and it still works.'
      : 'No proper noun, no number. Any school could say this.']);
  }
  if (SUPERLATIVE.test(text) && !SOURCE.test(text)) {
    score -= 8; bad.push([3, 'A superlative with nobody backing it up.']);
  }
  if (EXCLUSIVE.test(text) && !hasNumber && !names.length && !detail) {
    bad.push([2, "Says 'only' or 'first' but gives nothing to check."]);
  }
  if (wc < 4) { score -= 10; bad.push([2, 'Too short to prove anything.']); }
  if (wc > 50) { score -= 5; bad.push([1, 'Long. A claim should fit on a sticky note.']); }

  score = Math.round(Math.max(0, Math.min(100, score)));
  const passes = score >= 60;

  const ranked = [...bad, ...good].sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  // passes: lead with the good news; fails: lead with the problem
  const ordered = passes
    ? [...good.sort((a, b) => b[0] - a[0]).map((x) => x[1]), ...bad.sort((a, b) => b[0] - a[0]).map((x) => x[1])]
    : ranked;
  const reasons = [...new Set(ordered)].slice(0, 4);
  if (reasons.length < 2) {
    reasons.push(passes ? 'Specific enough to check.' : 'Would read fine on a rival\'s homepage.');
  }
  return { score, passes, reasons: reasons.slice(0, 4) };
}
