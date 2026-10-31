// R11 review tests. Each block in "mutation kills" fails against a specific planted mutant
// (see org/REVIEW.md, mutation table) and passes on the original engine.
// "known bugs" use it.fails: they document live defects and will start failing (loudly) once fixed,
// at which point the owner should flip them to plain it().
import { describe, it, expect } from 'vitest';
import { analyze, checkDistinction } from './index.js';
import { ALL_DIAGNOSES } from './titles.js';
import * as F from './fixtures.js';

const POOL_HIGH = new Set([
  'It Breathes', 'Get Out of the Brochure', 'The Specific Ones', 'It Lives.', 'The Unswappable',
]);

describe('R11 mutation kills', () => {
  // M06 (proof/cliche weights swapped), M11 (specificity target per 6 words instead of 9).
  // Calibration lock: exact scores and subscores of the shipped fixtures. If you retune on purpose, update these.
  it('pins fixture scores and subscores', () => {
    const pin = {
      GENERIC: ['Northfield University', 31, { cliche: 3, specificity: 0, proof: 0, swap: 0 }],
      // Retuned on purpose (MF1): "In 2024" is now a weak year, not full proof. Was 91 / specificity 86.
      SPECIFIC: ['Harrow College', 89, { cliche: 100, specificity: 81, proof: 100, swap: 100 }],
      MIXED: ['Brookline State', 62, { cliche: 31, specificity: 70, proof: 73, swap: 50 }],
      AVERAGE: ['Wexley College', 54, { cliche: 72, specificity: 29, proof: 60, swap: 40 }],
      PROGRAM: ['Calder University', 71, { cliche: 41, specificity: 74, proof: 80, swap: 75 }],
      STATS: ['Harrow College', 92, { cliche: 100, specificity: 88, proof: 100, swap: 100 }],
    };
    for (const [k, [name, score, subs]] of Object.entries(pin)) {
      const r = analyze(F[k], { schoolName: name });
      expect(r.score, k).toBe(score);
      expect(r.subscores, k).toEqual(subs);
    }
  });

  // M10: a tie between two once-only cliches is not "dominant".
  it('two tied cliches do not pick a cliche-themed poster', () => {
    const r = analyze('We have a vibrant community. Our faculty are world-class. Come visit us soon.');
    expect(r.band.id).toBe('haunted');
    const themed = [
      { title: 'Night of the Living Brochure', tagline: 'They are vibrant. They are a community. They are coming for your prospects.' },
      { title: 'The Texas Chainsaw Mission Statement', tagline: 'Seven committees. One sentence. No survivors.' },
    ];
    for (const t of themed) expect({ title: r.diagnosis.title, tagline: r.diagnosis.tagline }).not.toEqual(t);
  });

  // M13: escapeRe must escape regex metacharacters in school names.
  it("swaps a school name full of regex characters: St. Mary's (MD), A+B University", () => {
    const a = analyze("St. Mary's (MD) is a vibrant community. You will thrive.", { schoolName: "St. Mary's (MD)" });
    expect(a.logoSwap.swappedText).toBe('Literally Any University is a vibrant community. You will thrive.');
    const b = analyze('A+B University is great. AB University is not us.', { schoolName: 'A+B University' });
    expect(b.logoSwap.swappedText).toBe('Literally Any University is great. AB University is not us.');
  });

  // M20: Title Case headline with a period is still a headline, not a run of proper nouns.
  it('Title Case marketing headline is not a proper noun', () => {
    const s = analyze('Great Things Happen Here Every Single day.').sentences[0];
    expect(s.specifics).toEqual([]);
    expect(s.swappable).toBe(true);
  });

  // M23: concrete nouns are soft credit, never proof.
  it('a list of physical things is not proof', () => {
    const s = analyze('We have a kiln, a loom, and a piano.').sentences[0];
    expect(s.isProof).toBe(false);
  });

  // M24: passes is score >= 60, inclusive.
  it('a claim scoring exactly 60 passes', () => {
    const r = checkDistinction('Our library has 900 chairs for everyone to use.', { schoolName: 'Northfield University' });
    expect(r.score).toBe(60);
    expect(r.passes).toBe(true);
  });

  // M25: an unsourced superlative costs points, not just a reason line.
  it('adding "best" without a source lowers the claim score', () => {
    const plain = checkDistinction('The Kessler Farm has 40 cows and 3 barns.');
    const best = checkDistinction('The Kessler Farm has the best 40 cows and 3 barns.');
    expect(best.score).toBe(plain.score - 8);
  });

  // M28: cliche-themed horror titles are for dead copy only. A triumph poster must not get one.
  it('high-band copy with a dominant cliche keeps a triumph title', () => {
    const r = analyze('Hands-on learning at Pelican Point in 2024 with 40 students on the trawler Ada. Hands-on learning on the 12-meter trawler Ada since 1999 with Professor Ana Ruiz. Professor Ana Ruiz has run the Delaware Bay crab count for 31 years.');
    expect(['breathing', 'unmistakable']).toContain(r.band.id);
    expect(r.cliches[0].id).toBe('hands-on');
    expect(POOL_HIGH.has(r.diagnosis.title)).toBe(true);
  });

  // M30: your own name is stripped before comparing with rivals.
  it('rival shared phrases never include your own name', () => {
    const r = analyze('Northfield Gold Rowing wins in June.', {
      schoolName: 'Northfield', rivals: [{ name: 'Southgate', text: 'We beat Northfield Gold Rowing in June.' }],
    });
    expect(r.rivals[0].sharedPhrases).toEqual(['gold rowing']);
  });

  it('every diagnosis is reachable as an object with title and tagline', () => {
    for (const d of ALL_DIAGNOSES) expect(d.title && d.tagline).toBeTruthy();
  });
});

// Live defects found in review. These assert the CORRECT behavior and are expected to fail today.
describe('R11 known bugs (fixed by Engine lane, flipped from it.fails)', () => {
  it('FIXED: bare digits are not distinction ("123 456 789" scores 96 Unmistakable)', () => {
    expect(analyze('123 456 789').score).toBeLessThan(65);
  });
  it('FIXED: HTML attribute numbers count as proof', () => {
    expect(analyze('<div class="col-12 mt-4" data-id="98234"><p>We offer a great education.</p></div>').score).toBeLessThan(65);
  });
  it('FIXED: a bulleted list of cliches scores Breathing (bullet glyph defeats sentence-start check)', () => {
    expect(analyze('• World-class faculty\n• Vibrant community\n• Hands-on learning').score).toBeLessThan(50);
  });
  it('FIXED: appending a year to every generic sentence lifts GENERIC from 31 to Breathing', () => {
    const gamed = F.GENERIC.split(/(?<=\.)\s+/).map((s) => s.replace(/\.$/, ' in 2025.')).join(' ');
    expect(analyze(gamed, { schoolName: 'Northfield University' }).score).toBeLessThan(55);
  });
  it('FIXED: a one or two word paste is reported as "The Blank Page"', () => {
    expect(analyze('World-class faculty').diagnosis.title).not.toBe('The Blank Page');
  });
});

// Re-gate (round 2): kills for mutants that survived the fix commit (N02, N03, N04, N06, N11, N16).
describe('R11 re-gate mutation kills', () => {
  it('N02: a number followed by a filler word is not attached', () => {
    expect(analyze('We have 300 and counting here.').sentences[0].isProof).toBe(false);
  });
  it('N03: a mostly-digit sentence earns no number credit, even with a noun on the end', () => {
    const r = analyze('We teach 40 students. 1 2 3 4 5 6 7 8 9 10 classes.');
    expect(r.sentences.map((s) => s.isProof)).toEqual([true, false]);
  });
  it('N04: a bare number is not proof', () => {
    expect(analyze('We went 42.').sentences[0].isProof).toBe(false);
  });
  it('N06: a bullet glued to the first word still counts as sentence start', () => {
    const r = analyze('•World-class faculty\n•Vibrant community');
    expect(r.sentences.every((s) => s.specifics.length === 0)).toBe(true);
  });
  it('N11: inline tags are stripped, not just block tags', () => {
    expect(analyze('<p>Our <strong>vibrant community</strong> awaits you.</p>').sentences[0].text).toBe('Our vibrant community awaits you.');
  });
  it('N16: decoded entities never put an em or en dash on screen', () => {
    for (const e of ['&mdash;', '&ndash;']) expect(analyze(`We teach${e}and we listen.`).sentences[0].text).not.toMatch(/[–—]/);
  });
});

// Re-gate (round 2): remaining limits. it.fails = documents current behavior; flip to it() when fixed.
describe('R11 re-gate known limits (fixed sprint 2, flipped from it.fails)', () => {
  it('FIXED: vague counted nouns ("123 things") still score Unmistakable', () => {
    expect(analyze('We have 123 things and 456 others and 789 more.').score).toBeLessThan(65);
  });
  it('FIXED: a capital-letter initial is eaten as a list marker ("A. Smith" shows as "Smith")', () => {
    expect(analyze('A. Smith founded the college in 1891.').sentences[0].text).toBe('A. Smith founded the college in 1891.');
  });
  it('FIXED: ALL CAPS proof loses number credit ("112 BOOKS" is not attached)', () => {
    expect(analyze('EVERY STUDENT READS 112 BOOKS.').sentences[0].isProof).toBe(true);
  });
});
