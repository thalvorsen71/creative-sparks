// R11 sprint 2 review tests for the insight layer (insight.js, details.js).
// "mutation kills" each fail against a planted mutant (org/REVIEW.md, Sprint 2 mutation table) and pass on the original.
// "projector bugs" use it.fails: they assert the right behavior and fail today. Flip to it() when fixed.
import { describe, it, expect } from 'vitest';
import { analyze } from './index.js';

const N = { schoolName: 'Northfield University' };
const A = (t) => analyze(t, N);
const lede = (r) => r.buriedLede && [r.buriedLede.sentenceIndex, r.buriedLede.kind, r.buriedLede.position, r.buriedLede.detail];

describe('R11 sprint 2 mutation kills', () => {
  it('I01: a one-keyword theme is a weak lead, not a clear one', () => {
    const r = A('You will love our research.');
    expect(r.lead.label).not.toBeNull();
    expect(r.lead.confidence).toBe('weak');
  });
  it('I02: sentence 3 of 6 is buried, not early (first third means index < n/3)', () => {
    const r = A('We are glad you are here. Come visit. Students join the Kessler Rowing Club. Apply today. Our campus is lovely. Call us.');
    expect(lede(r)).toEqual([2, 'named program', 'buried', 'the Kessler Rowing Club']);
  });
  it('I04: a real detail wrapped in a cliche beats an equal unwrapped one', () => {
    const r = A('Welcome to campus. Students work at the Kessler Rowing Club. Our vibrant community includes the Pierogi Society.');
    expect(lede(r)).toEqual([2, 'named program', 'buried', 'the Pierogi Society']);
  });
  it('I05: equal details, the earlier sentence wins', () => {
    const r = A('Welcome to campus. Students row with the Kessler Rowing Club. Students sing in the Northfield Chamber Choir.');
    expect(r.buriedLede.sentenceIndex).toBe(1);
  });
  it('I06: a ranking outranks an outcome in the same sentence', () => {
    const r = A('You will join a school ranked No. 1 by U.S. News, where 94 percent of graduates are employed.');
    expect(r.promises.map((p) => p.proofKind)).toEqual(['third_party_recognition']);
  });
  it('I08: a promise on a different theme is not a restatement', () => {
    const r = A('We offer generous scholarships for every family. You will find a welcoming community here.');
    expect(r.promises.map((p) => p.proofKind)).toEqual(['none', 'none']);
  });
  it('I09: corpus examples rotate with the lead sentence, not always the same three', () => {
    const firsts = new Set(['We prepare you for the future.', 'Our graduates get great jobs and you will too.', 'You will be career-ready.']
      .map((t) => A(t).lead.examples[0]));
    expect(firsts.size).toBeGreaterThan(1);
  });
  it('I10: corpus shares round, not floor (20.7% reads as 21%, 12.7% as 13%)', () => {
    expect(A('We make a difference in the world. Come visit.').diagnosis.line).toContain('like 21% of the schools');
    expect(A('Our faith shapes everything we do, and you will grow in it. Come visit.').diagnosis.line).toContain('like 13% of the schools');
  });
  it('I11: "All receipts" needs zero logo-swap survivors', () => {
    expect(A('Founded in 1891. 4,112 undergraduates from 49 states. Come visit us soon.').diagnosis.line).not.toMatch(/^All receipts/);
  });
  it('I12: "behind N sentences any school could sign" counts only swappable ones', () => {
    const r = A('We enroll 4,112 undergraduates. Our faculty care about you. Our campus is lovely. Students row with the Kessler Rowing Club.');
    expect(r.buriedLede.why).toContain('behind 2 sentences any school could sign');
  });
  it('I13: a first reads inline in the line, unquoted', () => {
    const r = A('We prepare you for the future. We have the only collegiate falconry team in Ohio.');
    expect(r.diagnosis.line).toContain('your best detail, the only collegiate falconry team, waits');
  });
  it('D03: "must" with no concrete detail is not a requirement lede', () => {
    expect(A('We are a caring school. Students must be kind to each other.').buriedLede).toBeNull();
  });
  it('D04: a lede clause is cut at 16 words', () => {
    const r = A('We care. Every student completes a long and winding and genuinely difficult senior research project that takes the whole year to finish and then some more.');
    expect(r.buriedLede.detail.endsWith('...')).toBe(true);
    expect(r.buriedLede.detail.split(/\s+/).length).toBe(16);
  });
  it('D05: a sentence with two kinds of detail beats one with one kind', () => {
    const r = A('Welcome to campus. Students row with the Kessler Rowing Club. Students sail with the Harbor Sailing Club on Delaware Bay.');
    expect(r.buriedLede.sentenceIndex).toBe(2);
  });
  it('D06 + D07: the named program keeps its "the", and the first of two equal ones wins', () => {
    expect(A('Welcome. Students join the Rowing Club and the Chess Society.').buriedLede.detail).toBe('the Rowing Club');
    expect(analyze(require_mixed(), { schoolName: 'Brookline State' }).buriedLede.detail).toBe('the Competitive Pierogi Society');
  });
  it('D09: a named program outranks a bare place', () => {
    const r = A('We are here. Students sail on Delaware Bay. Students join the Kessler Rowing Club.');
    expect(r.buriedLede.sentenceIndex).toBe(2);
  });
});

function require_mixed() {
  return 'At Brookline State, we prepare you for the future. Our vibrant community includes 214 student clubs, from the Competitive Pierogi Society to a 40-member bagpipe band. Our world-class faculty are passionate about teaching.';
}

// Live defects that would put something false on a projector. See REVIEW.md Sprint 2 MUST-FIX.
describe('R11 sprint 2 projector bugs (it.fails until fixed)', () => {
  it.fails('MF-S1: a building is not "a named program" and not the best detail', () => {
    const r = A('Smith Hall, Jones Center and the Brown Quad are at the heart of campus. Our students thrive here.');
    expect(r.buriedLede).toBeNull();
  });
  it.fails('MF-S1: a rec center behind a cliche is not the buried lede', () => {
    const r = A('Welcome home. Our vibrant community includes a Starbucks, a Chick-fil-A and the Student Recreation Center. You will find your place here.');
    expect(r.buriedLede).toBeNull();
  });
  it.fails('MF-S2: a registration deadline is not "a requirement, something every student actually does" or proof', () => {
    const r = A('Students must register for classes by August 1. We are a vibrant community.');
    expect(r.diagnosis.line).not.toMatch(/you opened with the proof/);
  });
  it.fails('MF-S2: a bookstore sale is not a ritual, and the detail is not a dangling clause', () => {
    const r = A('Every year since 1985, the bookstore has held a sale in May. We prepare you for the future.');
    expect(r.buriedLede?.detail).not.toBe('Every year since 1985');
  });
  it.fails('MF-S3: a published no-tuition policy is not told it "says how nothing works"', () => {
    const r = A('If your family earns under $80,000 a year, you pay no tuition. That has been true since 2019, and 1,140 students used it this fall.');
    expect(r.diagnosis.line).not.toMatch(/none says how anything here actually works/);
  });
  it.fails('MF-S3: a no-tuition policy that 1,140 students used has a buried lede (it scores 90 and the page says "Nothing only you could say")', () => {
    const r = A('If your family earns under $80,000 a year, you pay no tuition. That has been true since 2019, and 1,140 students used it this fall.');
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.buriedLede).not.toBeNull();
  });
  it.fails('MF-S4: when the detector finds nothing, the line hedges instead of asserting there is nothing', () => {
    const r = A('At Northfield, you will thrive. Nursing students start clinical rotations in their first semester instead of their third. Faculty grade every lab report within 48 hours. We are proud of our graduates.');
    expect(r.diagnosis.line).not.toMatch(/^There is no detail here only you could write/);
  });
});
