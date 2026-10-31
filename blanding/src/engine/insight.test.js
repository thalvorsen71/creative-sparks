import { describe, it, expect } from 'vitest';
import CORPUS from '../corpus/corpus.json';
import { analyze, checkDistinction } from './index.js';
import { findDetails } from './details.js';
import { findSpecifics } from './detect.js';
import * as F from './fixtures.js';

const NAMES = {
  GENERIC: 'Northfield University', SPECIFIC: 'Harrow College', MIXED: 'Brookline State', AVERAGE: 'Wexley College',
  PROGRAM: 'Calder University', TAGLINE: 'Northfield University', STATS: 'Harrow College',
};
const run = (k) => analyze(F[k], { schoolName: NAMES[k] });
const corpusTheme = (id) => CORPUS.themes.find((t) => t.id === id);
const KINDS = ['restated_claim', 'operating_mechanism', 'reported_outcome', 'published_policy', 'example_or_story', 'third_party_recognition', 'none'];
const V3_ONLY = ['educational model', 'tradition / heritage / values / faith'];
const DASH = /[–—]/;
const details = (t) => findDetails(t, findSpecifics(t, null));

describe('Amendment 2 shape', () => {
  for (const k of Object.keys(NAMES)) {
    it(`${k} has themes, lead, promises, buriedLede, diagnosis.line`, () => {
      const r = run(k);
      for (const t of r.themes) {
        expect(corpusTheme(t.id) || V3_ONLY.includes(t.id), t.id).toBeTruthy();
        expect(typeof t.label).toBe('string');
        expect(t.sentences.length).toBeGreaterThan(0);
      }
      expect(['clear', 'weak', 'none']).toContain(r.lead.confidence);
      expect(r.lead.examples.length).toBeLessThanOrEqual(3);
      if (r.lead.themeId) {
        expect(r.lead.quote).toBe(r.sentences[r.lead.sentenceIndex].text);
        const ct = corpusTheme(r.lead.themeId);
        expect(r.lead.corpusShare).toBe(ct ? ct.share : null);
        for (const e of r.lead.examples) expect(ct.examples).toContain(e);
      } else {
        expect(r.lead.sentenceIndex).toBeNull();
        expect(r.lead.corpusShare).toBeNull();
      }
      expect(r.promises.map((p) => p.sentenceIndex)).toEqual(r.sentences.filter((s) => s.isPromise).map((s) => s.i));
      for (const p of r.promises) {
        expect(KINDS).toContain(p.proofKind);
        if (p.proofKind === 'none') expect(p.evidenceIndex).toBeNull();
        else expect(Number.isInteger(p.evidenceIndex)).toBe(true);
      }
      if (r.buriedLede) {
        expect(['lead', 'early', 'buried']).toContain(r.buriedLede.position);
        expect(r.buriedLede.text).toBe(r.sentences[r.buriedLede.sentenceIndex].text);
        expect(r.buriedLede.detail.length).toBeGreaterThan(0);
        expect(r.buriedLede.why).not.toMatch(DASH);
      }
      expect(typeof r.diagnosis.line).toBe('string');
      expect(r.diagnosis.line.length).toBeGreaterThan(20);
    });
  }
  it('empty input gets defaults', () => {
    const r = analyze('   ');
    expect(r.themes).toEqual([]);
    expect(r.promises).toEqual([]);
    expect(r.buriedLede).toBeNull();
    expect(r.lead).toEqual({ reason: 'no_promise', themeId: null, label: null, sentenceIndex: null, quote: null, confidence: 'none', corpusShare: null, examples: [] });
    expect(r.diagnosis.line).toBe('Paste some copy. We will wait.');
  });
  it('is deterministic', () => {
    for (const k of Object.keys(NAMES)) expect(JSON.stringify(run(k))).toBe(JSON.stringify(run(k)));
  });
});

describe('themes and lead promise', () => {
  it('GENERIC leads with career outcomes, clearly, in sentence 1', () => {
    const r = run('GENERIC');
    expect(r.lead.themeId).toBe('career outcomes');
    expect(r.lead.sentenceIndex).toBe(0);
    expect(r.lead.confidence).toBe('clear');
  });
  it('classifies obvious theme sentences', () => {
    const cases = {
      'We meet 100 percent of demonstrated financial aid need, so tuition is never the reason you cannot come.': 'access',
      'Our graduates land jobs with top employers.': 'career',
      'Small classes and faculty mentors who know your name.': 'personal',
      'Founded on Jesuit values and a heritage of faith.': 'tradition',
      'Design your own major and explore your options.': 'your',
      'You belong here, in a close-knit community.': 'belonging',
    };
    for (const [t, first] of Object.entries(cases)) {
      const r = analyze(t);
      expect(r.themes[0] && r.themes[0].id.split(/[\s/]/)[0], t).toBe(first);
    }
  });
  it('no promises means no lead', () => {
    const r = run('SPECIFIC');
    expect(r.lead.confidence).toBe('none');
    expect(r.lead.themeId).toBeNull();
  });
  it('examples are picked deterministically and only from the corpus', () => {
    const a = run('MIXED').lead.examples;
    expect(run('MIXED').lead.examples).toEqual(a);
    const ct = corpusTheme(run('MIXED').lead.themeId);
    expect(a.length).toBe(Math.min(3, ct.examples.length));
  });
});

describe('proof kinds', () => {
  const kindOf = (t, i = 0) => analyze(t).promises.find((p) => p.sentenceIndex === i).proofKind;
  it('MIXED: mechanism, then story', () => {
    const p = run('MIXED').promises;
    expect(p.find((x) => x.sentenceIndex === 0)).toMatchObject({ proofKind: 'operating_mechanism', evidenceIndex: 1 });
    expect(p.find((x) => x.sentenceIndex === 2)).toMatchObject({ proofKind: 'example_or_story', evidenceIndex: 3 });
  });
  it('GENERIC: nothing, or the same claim said twice', () => {
    const p = run('GENERIC').promises;
    expect(p.every((x) => ['none', 'restated_claim'].includes(x.proofKind))).toBe(true);
    expect(p.some((x) => x.proofKind === 'restated_claim')).toBe(true);
  });
  it('restated_claim: repeating the promise is not evidence', () => {
    const r = analyze('Our small classes mean personal attention. Our faculty mentors know your name.');
    expect(r.promises[0]).toMatchObject({ proofKind: 'restated_claim', evidenceIndex: 1 });
  });
  it('third party, outcome, policy', () => {
    expect(kindOf('We are one of the best colleges, ranked No. 12 by U.S. News in 2025.')).toBe('third_party_recognition');
    expect(kindOf('You will get a job: 94 percent of graduates were employed within six months.')).toBe('reported_outcome');
    expect(kindOf('You can afford it: we guarantee free tuition for families earning under $80,000.')).toBe('published_policy');
  });
});

describe('buried lede', () => {
  it('MIXED: the Competitive Pierogi Society, wrapped in a cliche, sentence 2', () => {
    const b = run('MIXED').buriedLede;
    expect(b.sentenceIndex).toBe(1);
    expect(b.detail).toContain('Competitive Pierogi Society');
    expect(b.position).toBe('early');
    expect(b.why).toContain('vibrant community');
  });
  it('SPECIFIC opens with its lede', () => {
    expect(run('SPECIFIC').buriedLede.position).toBe('lead');
  });
  it('a buried detail is reported as buried', () => {
    const t = 'We prepare you for the future. Our vibrant community welcomes you. Our faculty care. You will thrive here. Join us today. Senior year ends with a 90-minute oral exam in front of three tutors, open to the public.';
    const r = analyze(t);
    expect(r.buriedLede.sentenceIndex).toBe(5);
    expect(r.buriedLede.position).toBe('buried');
    expect(r.buriedLede.why).toMatch(/sentence 6 of 6/);
    expect(r.diagnosis.line).toMatch(/waits until sentence 6 of 6/);
  });
  it('numbers and proper nouns alone are not a lede (the T0 v3 lesson)', () => {
    expect(run('STATS').buriedLede).toBeNull();
    expect(run('AVERAGE').buriedLede).toBeNull();
    expect(analyze('Wexley enrolls 2,300 students from 49 states. Professor Jane Smith teaches at Oxford.').buriedLede).toBeNull();
  });
  it('detects mechanism, structure, requirement, place, first, named program', () => {
    const kinds = (t) => details(t).map((d) => d.kind);
    expect(kinds('Senior year ends with a 90-minute oral exam in front of three tutors.')).toEqual(expect.arrayContaining(['requirement', 'structure']));
    expect(kinds('There are no majors and no lectures.')).toContain('structure');
    expect(kinds('Every first-year reads the Odyssey in September.')).toContain('requirement');
    expect(kinds('We field the only collegiate falconry team in the state.')).toContain('first');
    expect(kinds('We are the only school that cares.')).not.toContain('first');
    expect(kinds('Our lab tracked 3,000 horseshoe crabs on Delaware Bay.')).toEqual(expect.arrayContaining(['mechanism', 'place']));
    expect(kinds('First-years can join the Competitive Pierogi Society.')).toContain('named program');
    expect(kinds('First-years can join the Honors Program.')).not.toContain('named program');
  });
});

describe('diagnosis.line', () => {
  for (const k of Object.keys(NAMES)) {
    it(`${k}: one sentence, no dashes, only real numbers`, () => {
      const r = run(k);
      const line = r.diagnosis.line;
      expect(line).not.toMatch(DASH);
      expect(line.replace(/“[^”]*”/g, '')).not.toMatch(/[.!?]\s+\p{Lu}/u); // one sentence
      for (const m of line.replace(/“[^”]*”/g, '').matchAll(/(\d+)%/g)) {
        expect(Number(m[1])).toBe(Math.round(r.lead.corpusShare * 100));
      }
      for (const m of line.replace(/“[^”]*”/g, '').replace(/\d+%/g, '').matchAll(/\d+/g)) {
        expect(Number(m[0])).toBeLessThanOrEqual(r.stats.sentences);
      }
    });
  }
  it('picks the template from the findings', () => {
    expect(run('GENERIC').diagnosis.line).toMatch(/^You lead with .*every sentence would survive a logo swap\.$/);
    expect(run('MIXED').diagnosis.line).toMatch(/Competitive Pierogi Society, is stuck in sentence 2 behind “vibrant community”/);
    expect(run('SPECIFIC').diagnosis.line).toMatch(/^You open with /);
    expect(run('STATS').diagnosis.line).toMatch(/^All receipts, no story/);
    expect(run('TAGLINE').diagnosis.line).toMatch(/^One line/);
    expect(analyze('Our campus is lovely. We care about you.').diagnosis.line).toMatch(/logo swap/);
  });
  it('cites the corpus share for the lead theme', () => {
    const r = run('GENERIC');
    expect(r.diagnosis.line).toContain(`${Math.round(corpusTheme('career outcomes').share * 100)}% of the schools we read`);
  });
});

describe('sprint 1 leftovers', () => {
  it('vague counted nouns are not proof', () => {
    expect(analyze('We have 123 things and 456 others.').score).toBeLessThan(65);
    expect(analyze('There are 40 reasons to visit.').sentences[0].isProof).toBe(false);
    expect(analyze('There are 40 student clubs.').sentences[0].isProof).toBe(true);
  });
  it('falconry passes on the first, not on Ohio', () => {
    const a = checkDistinction('the only collegiate falconry team in Ohio');
    expect(a.passes).toBe(true);
    expect(a.reasons[0]).toMatch(/only collegiate falconry team/);
    const b = checkDistinction('the only collegiate falconry team');
    expect(b.passes).toBe(true);
    expect(checkDistinction('We are the only school that cares.').passes).toBe(false);
  });
  it('day names are not "something real"', () => {
    const r = checkDistinction('Classes meet on Monday.');
    expect(r.reasons.join(' ')).not.toMatch(/Names something real: Monday/);
  });
});

describe('typography', () => {
  // A straight ' at a word edge is a quotation mark. Apostrophes (else's) sit inside words and are fine.
  const STRAIGHT_QUOTE = /(?:^|[\s(:,“])'|'(?=[\s.,;:!?)]|$)/;
  it('user-facing engine strings use curly quotes, never straight ones', async () => {
    const { LEXICON, bandFor } = await import('./index.js');
    const { ALL_DIAGNOSES } = await import('./titles.js');
    const texts = [
      ...Object.values(F),
      'We prepare you for the future. Our vibrant community includes the Competitive Pierogi Society.',
      'Our campus is lovely. We care. You will thrive. Join us. Senior year ends with a 90-minute oral exam.',
      'There are no majors and no lectures. We are the only collegiate falconry team.',
    ];
    const strings = [
      ...LEXICON.flatMap((l) => [l.phrase, l.translation, l.fix]),
      ...ALL_DIAGNOSES.flatMap((d) => [d.title, d.tagline]),
      ...[0, 30, 50, 65, 80].map((s) => bandFor(s).verdict),
      analyze('').diagnosis.line,
    ];
    for (const t of texts) {
      const r = analyze(t);
      strings.push(r.diagnosis.title, r.diagnosis.tagline, r.diagnosis.line);
      if (r.buriedLede) strings.push(r.buriedLede.why);
    }
    for (const c of ['We have a vibrant community.', 'the only collegiate falconry team', 'There are no majors and no lectures.',
      'Every first-year rows on the Kessler River.', 'We are the only school that cares.', 'Our lab tracked 300 crabs.', '', 'x']) {
      strings.push(...checkDistinction(c).reasons);
    }
    expect(strings.some((s) => /[“”]/.test(s))).toBe(true);
    for (const s of strings) expect(s, s).not.toMatch(STRAIGHT_QUOTE);
  });
});

describe('R11 sprint 2 fixes: modest right beats confident wrong', () => {
  const N = { schoolName: 'Northfield University' };
  it('buildings are never crowned; a facility counts only when something happens there', () => {
    expect(analyze('Visit the Johnson Center, the Miller Library and Smith Hall. We are glad you came.', N).buriedLede).toBeNull();
    const p = run('PROGRAM').buriedLede;
    expect(p.detail).toBe('the Pelican Point Field Station');
    expect(p.kind).toBe('place');
    expect(analyze('Students spend every Friday restoring trails in the Kessler Forest Preserve. Come visit.').buriedLede.kind).toBe('place');
  });
  it('trivia, retail and paperwork are never a lede or a mechanism', () => {
    for (const t of ['Students must register for classes by August 1.', 'Every year since 1985, the bookstore has held a sale in May.',
      'Parking permits are due by September 3.', 'Our vibrant community includes a Starbucks and 3 food trucks.']) {
      const r = analyze(`${t} We are glad you are here.`);
      expect(r.buriedLede, t).toBeNull();
      expect(r.promises.every((x) => x.proofKind !== 'operating_mechanism'), t).toBe(true);
    }
  });
  it('a lede detail is never a fragment under five words', () => {
    const r = analyze('Every year since 1985, the crew has rowed the Kessler River at dawn. We prepare you for the future.');
    if (r.buriedLede) expect(r.buriedLede.detail.split(/\s+/).length).toBeGreaterThanOrEqual(5);
  });
  it('mechanisms without proper nouns are found (nursing)', () => {
    const r = analyze('At Northfield, you will thrive. Nursing students start clinical rotations in their first semester instead of their third. Faculty grade every lab report within 48 hours.', N);
    expect([1, 2]).toContain(r.buriedLede.sentenceIndex);
    expect(r.diagnosis.line).not.toMatch(/could not find/);
  });
  it('no lede: the line hedges, it never asserts absence', () => {
    for (const k of ['GENERIC', 'AVERAGE']) {
      expect(run(k).diagnosis.line).toMatch(/we could not find/i);
      expect(run(k).diagnosis.line).not.toMatch(/there is no|nothing here is|none says/i);
    }
  });
  it('lead.reason explains a missing lead promise', () => {
    expect(run('SPECIFIC').lead.reason).toBe('proof_first');
    expect(run('STATS').lead.reason).toBe('proof_first');
    expect(analyze('If your family earns under $80,000 a year, you pay no tuition. That has been true since 2019, and 1,140 students used it this fall.').lead.reason).toBe('proof_first');
    expect(analyze('Come and see us. It is a nice day.').lead.reason).toBe('no_promise');
    expect(run('GENERIC').lead.reason).toBeNull();
  });
  it('the no-tuition policy is the lede, a published policy', () => {
    const r = analyze('If your family earns under $80,000 a year, you pay no tuition. That has been true since 2019, and 1,140 students used it this fall.');
    expect(r.buriedLede).toMatchObject({ sentenceIndex: 0, kind: 'policy', position: 'lead' });
    expect(r.diagnosis.line).toMatch(/^You open with/);
  });
  it('STATS still gets "All receipts", hedged', () => {
    expect(run('STATS').diagnosis.line).toMatch(/^All receipts, no story: .*so add one sentence about how something here actually works\.$/);
  });
});

describe('one source of truth: orphans and proofKind', () => {
  const ADV = [
    'Smith Hall, Jones Center and the Brown Quad are at the heart of campus. Our students thrive here.',
    'Welcome home. Our vibrant community includes a Starbucks, a Chick-fil-A and the Student Recreation Center. You will find your place here.',
    'Students must register for classes by August 1. We are a vibrant community.',
    'Every year since 1985, the bookstore has held a sale in May. We prepare you for the future.',
    'If your family earns under $80,000 a year, you pay no tuition. That has been true since 2019, and 1,140 students used it this fall.',
    'At Northfield, you will thrive. Nursing students start clinical rotations in their first semester instead of their third. Faculty grade every lab report within 48 hours. We are proud of our graduates.',
    'Our world-class faculty of 400 prepare you for the future. 98% of our vibrant community of 12,000 thrives.',
    'We have 123 things and 456 others and 789 more.',
    '• World-class faculty\n• Vibrant community\n• Hands-on learning',
  ];
  const reports = [...Object.keys(NAMES).map(run), ...ADV.map((t) => analyze(t, { schoolName: 'Northfield University' }))];
  it('a promise is orphaned iff its proofKind is none or restated_claim, everywhere', () => {
    for (const r of reports) {
      const orphanSet = new Set(r.promiseProof.orphans);
      expect(r.promiseProof.promises).toBe(r.promises.length);
      for (const p of r.promises) {
        expect(orphanSet.has(p.sentenceIndex), r.sentences[p.sentenceIndex].text).toBe(['none', 'restated_claim'].includes(p.proofKind));
      }
      for (const o of orphanSet) expect(r.promises.some((p) => p.sentenceIndex === o)).toBe(true);
    }
  });
});

describe('the line agrees with the score', () => {
  const ADV = [
    'Northfield Promise covers tuition for 1,200 Ohio families. 98 percent of them graduate. Since 2015, 6,400 students have used it.',
    'Start here, finish anywhere. Credits transfer to all 14 state universities through our guaranteed transfer agreement. Classes cost $142 per credit hour.',
    'Every first-year spends a week at the Kessler Farm, and the dining hall serves what they grow. We prepare you for the future.',
    'If your family earns under $80,000 a year, you pay no tuition. That has been true since 2019, and 1,140 students used it this fall.',
    'Smith Hall, Jones Center and the Brown Quad are at the heart of campus. Our students thrive here.',
    'Our world-class faculty of 400 prepare you for the future. 98% of our vibrant community of 12,000 thrives.',
    'Dr. Lena Ortiz teaches Chemistry 101 in Room 204. She has done so since 1998. U.S. News ranked the program No. 12 in 2025.',
    'We offer great programs for 300 students. We have 12 buildings. There are 5 dining halls.',
    'At Northfield, you will thrive. Nursing students start clinical rotations in their first semester instead of their third.',
  ];
  it('"could not find" never appears with a strong band or zero logo-swap survivors', () => {
    const reports = [...Object.keys(NAMES).map(run), ...ADV.map((t) => analyze(t, { schoolName: 'Northfield University' }))];
    for (const r of reports) {
      if (!/could not find/i.test(r.diagnosis.line)) continue;
      expect(['breathing', 'unmistakable'], r.diagnosis.line).not.toContain(r.band.id);
      expect(r.logoSwap.survivors.length, r.diagnosis.line).toBeGreaterThan(0);
    }
  });
  it('should-fixes: a guaranteed transfer is a policy lede; a dining hall does not veto the farm', () => {
    expect(analyze(ADV[1]).buriedLede).toMatchObject({ kind: 'policy' });
    expect(analyze(ADV[2]).buriedLede).not.toBeNull();
  });
});

describe('praise matches the band', () => {
  it('"you opened with the proof" never appears at haunted or below', () => {
    const texts = [...Object.values(F),
      'We pledge to help every student succeed. You will find your place here.',
      'We have transfer agreements with many schools. Our vibrant community welcomes you.',
      'Every first-year spends a week at the Kessler Farm. We prepare you for the future. Our vibrant community is world-class. You will thrive.',
      'Students must register for classes by August 1. We are a vibrant community.',
      'Credits transfer to all 14 state universities through our guaranteed transfer agreement. Come visit.',
      'The only college where every student rows.'];
    for (const t of texts) {
      const r = analyze(t, { schoolName: 'Northfield University' });
      if (['embalmed', 'haunted'].includes(r.band.id)) expect(r.diagnosis.line, t).not.toMatch(/you opened with the proof/);
    }
  });
  it('soft policy words need a concrete term', () => {
    expect(analyze('We pledge to help every student succeed. Come visit.').buriedLede).toBeNull();
    expect(analyze('Come visit. Credits transfer to all 14 state universities through our guaranteed transfer agreement.').buriedLede).toMatchObject({ kind: 'policy' });
  });
});
