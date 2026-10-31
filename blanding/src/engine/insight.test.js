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
    expect(r.lead).toEqual({ themeId: null, label: null, sentenceIndex: null, quote: null, confidence: 'none', corpusShare: null, examples: [] });
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
      expect(line.replace(/'[^']*'/g, '')).not.toMatch(/[.!?]\s+\p{Lu}/u); // one sentence
      for (const m of line.replace(/'[^']*'/g, '').matchAll(/(\d+)%/g)) {
        expect(Number(m[1])).toBe(Math.round(r.lead.corpusShare * 100));
      }
      for (const m of line.replace(/'[^']*'/g, '').replace(/\d+%/g, '').matchAll(/\d+/g)) {
        expect(Number(m[0])).toBeLessThanOrEqual(r.stats.sentences);
      }
    });
  }
  it('picks the template from the findings', () => {
    expect(run('GENERIC').diagnosis.line).toMatch(/^You lead with .*every sentence would survive a logo swap\.$/);
    expect(run('MIXED').diagnosis.line).toMatch(/Competitive Pierogi Society, is stuck in sentence 2 behind 'vibrant community'/);
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
