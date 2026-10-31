import { describe, it, expect } from 'vitest';
import { analyze, checkDistinction, LEXICON, bandFor } from './index.js';
import { ALL_DIAGNOSES } from './titles.js';
import { splitSentences } from './text.js';
import * as F from './fixtures.js';

const NAMES = {
  GENERIC: 'Northfield University',
  SPECIFIC: 'Harrow College',
  MIXED: 'Brookline State',
  AVERAGE: 'Wexley College',
  PROGRAM: 'Calder University',
  TAGLINE: 'Northfield University',
  STATS: 'Harrow College',
};
const run = (k) => analyze(F[k], { schoolName: NAMES[k] });
const DASH = /[–—]/;
const BAND_IDS = ['embalmed', 'haunted', 'twitching', 'breathing', 'unmistakable'];

function expectShape(r) {
  expect(Number.isInteger(r.score)).toBe(true);
  expect(r.score).toBeGreaterThanOrEqual(0);
  expect(r.score).toBeLessThanOrEqual(100);
  expect(BAND_IDS).toContain(r.band.id);
  expect(typeof r.band.label).toBe('string');
  expect(typeof r.band.verdict).toBe('string');
  for (const k of ['cliche', 'specificity', 'proof', 'swap']) {
    expect(r.subscores[k]).toBeGreaterThanOrEqual(0);
    expect(r.subscores[k]).toBeLessThanOrEqual(100);
  }
  for (const k of ['words', 'sentences', 'clicheHits', 'clicheDensity']) expect(typeof r.stats[k]).toBe('number');
  expect(r.stats.sentences).toBe(r.sentences.length);
  r.sentences.forEach((s, i) => {
    expect(s.i).toBe(i);
    expect(typeof s.text).toBe('string');
    expect(typeof s.isPromise).toBe('boolean');
    expect(typeof s.isProof).toBe('boolean');
    expect(typeof s.swappable).toBe('boolean');
    expect(Array.isArray(s.specifics)).toBe(true);
    expect(Object.keys(s).sort()).toEqual(['cliches', 'i', 'isPromise', 'isProof', 'specifics', 'swappable', 'swapped', 'text']);
    expect(typeof s.swapped).toBe('string');
  });
  for (const c of r.cliches) {
    expect(Object.keys(c).sort()).toEqual(['count', 'fix', 'id', 'phrase', 'severity', 'translation']);
    expect([1, 2, 3]).toContain(c.severity);
  }
  for (let i = 1; i < r.cliches.length; i++) expect(r.cliches[i - 1].count).toBeGreaterThanOrEqual(r.cliches[i].count);
  expect(r.logoSwap.swapName).toBe('Literally Any University');
  expect(typeof r.logoSwap.swappedText).toBe('string');
  expect(r.logoSwap.total).toBe(r.sentences.length);
  expect(r.logoSwap.survivors).toEqual(r.sentences.filter((s) => s.swappable).map((s) => s.i));
  expect(r.promiseProof.promises).toBe(r.sentences.filter((s) => s.isPromise).length);
  expect(r.promiseProof.proofs).toBe(r.sentences.filter((s) => s.isProof).length);
  expect(Array.isArray(r.rivals)).toBe(true);
  expect(typeof r.diagnosis.title).toBe('string');
  expect(typeof r.diagnosis.tagline).toBe('string');
  expect(r.band).toEqual(bandFor(r.score));
}

describe('contract shape', () => {
  for (const k of Object.keys(NAMES)) {
    it(`${k} matches the contract`, () => expectShape(run(k)));
  }
  it('LEXICON entries are well formed and unique', () => {
    expect(LEXICON.length).toBeGreaterThanOrEqual(70);
    expect(LEXICON.length).toBeLessThanOrEqual(100);
    expect(new Set(LEXICON.map((l) => l.id)).size).toBe(LEXICON.length);
    for (const l of LEXICON) {
      expect(l.patterns.length).toBeGreaterThan(0);
      for (const p of l.patterns) expect(p).toBeInstanceOf(RegExp);
      expect(l.translation.length).toBeGreaterThan(0);
      expect(l.fix.length).toBeGreaterThan(0);
      expect([1, 2, 3]).toContain(l.severity);
    }
  });
});

describe('calibration', () => {
  const ranges = {
    GENERIC: [25, 45],
    MIXED: [45, 65],
    SPECIFIC: [78, 95],
    AVERAGE: [45, 58],
    PROGRAM: [60, 78],
    TAGLINE: [20, 45],
    STATS: [82, 97],
  };
  for (const [k, [lo, hi]] of Object.entries(ranges)) {
    it(`${k} lands ${lo}-${hi}`, () => {
      const { score } = run(k);
      expect(score).toBeGreaterThanOrEqual(lo);
      expect(score).toBeLessThanOrEqual(hi);
    });
  }
  it('orders the fixtures sensibly', () => {
    const s = (k) => run(k).score;
    expect(s('GENERIC')).toBeLessThan(s('AVERAGE'));
    expect(s('AVERAGE')).toBeLessThan(s('MIXED'));
    expect(s('MIXED')).toBeLessThan(s('SPECIFIC'));
  });
  it('the school name does not count as specificity', () => {
    const r = analyze('Welcome to Northfield University. Northfield is home.', { schoolName: 'Northfield University' });
    expect(r.subscores.specificity).toBe(0);
    expect(r.sentences.every((s) => s.swappable)).toBe(true);
  });
  it('GENERIC hits most of the canonical cliches', () => {
    const ids = run('GENERIC').cliches.map((c) => c.id);
    for (const id of ['leaders-of-tomorrow', 'vibrant-community', 'world-class', 'hands-on', 'cutting-edge',
      'prepare-future', 'discover-your-passion', 'make-a-difference', 'diverse-inclusive', 'tradition-of-excellence',
      'transform-your-world', 'state-of-the-art', 'endless-opportunities', 'inside-outside-classroom', 'more-than-a-number']) {
      expect(ids).toContain(id);
    }
  });
  it('SPECIFIC has zero cliches and no logo-swap survivors', () => {
    const r = run('SPECIFIC');
    expect(r.stats.clicheHits).toBe(0);
    expect(r.logoSwap.survivors).toEqual([]);
  });
});

describe('empty and garbage input', () => {
  for (const input of ['', '   ', '\n\n\t', null, undefined, '!!!', '...', {}, '<p>&nbsp;</p>']) {
    it(`does not throw on ${JSON.stringify(input)}`, () => {
      const r = analyze(input);
      expect(r.score).toBe(0);
      expect(r.sentences).toEqual([]);
      expect(r.cliches).toEqual([]);
      expect(r.rivals).toEqual([]);
      expect(r.logoSwap.survivors).toEqual([]);
      expect(r.promiseProof.orphans).toEqual([]);
      expectShape(r);
    });
  }
  it('tolerates bad opts', () => {
    expect(() => analyze(F.MIXED, null)).not.toThrow();
    expect(() => analyze(F.MIXED, { schoolName: '(((', rivals: [null, {}, { name: 'X' }] })).not.toThrow();
    expect(() => analyze(F.MIXED, { schoolName: '   ' })).not.toThrow();
  });
  it('long weird text does not throw', () => {
    const junk = Array.from({ length: 300 }, (_, i) => `x${i}?! ${'A'.repeat(i % 7)} ... ${i}%`).join(' ');
    expect(() => analyze(junk, { schoolName: 'A' })).not.toThrow();
  });
});

describe('determinism', () => {
  it('same input, same output', () => {
    for (const k of Object.keys(NAMES)) {
      const opts = { schoolName: NAMES[k], rivals: [{ name: 'Northfield University', text: F.GENERIC }] };
      expect(JSON.stringify(analyze(F[k], opts))).toBe(JSON.stringify(analyze(F[k], opts)));
    }
  });
  it('regex state does not leak between calls', () => {
    const a = analyze(F.GENERIC).stats.clicheHits;
    analyze(F.MIXED);
    expect(analyze(F.GENERIC).stats.clicheHits).toBe(a);
  });
});

describe('logo swap', () => {
  it('replaces the full name and the bare stem, case-insensitively', () => {
    const r = analyze(F.GENERIC, { schoolName: 'Northfield University' });
    expect(r.logoSwap.swappedText).not.toMatch(/northfield/i);
    expect(r.logoSwap.swappedText).toContain('Welcome to Literally Any University, where');
    expect(r.logoSwap.swappedText).toContain('At Literally Any University, you will');
  });
  it('does not replace the stem inside other words', () => {
    const r = analyze('Northfielders love Northfield College. Visit northfield college today.', { schoolName: 'Northfield College' });
    expect(r.logoSwap.swappedText).toBe('Northfielders love Literally Any University. Visit Literally Any University today.');
  });
  it('without a schoolName, text is unchanged', () => {
    expect(analyze(F.MIXED).logoSwap.swappedText).toBe(F.MIXED.trim());
  });
  it('GENERIC: every sentence survives the swap', () => {
    const r = run('GENERIC');
    expect(r.logoSwap.survivors.length).toBe(r.logoSwap.total);
    expect(r.subscores.swap).toBe(0);
  });
  it('MIXED: only the proof sentences fail the swap', () => {
    expect(run('MIXED').logoSwap.survivors).toEqual([0, 2]);
  });
});

describe('promise and proof', () => {
  it('flags orphans: promise with no proof in same or next sentence', () => {
    const t = 'We prepare you for the future. Our faculty are dedicated to your success. The library has 2 million books. You will thrive here.';
    const r = analyze(t);
    expect(r.sentences.map((s) => s.isPromise)).toEqual([true, true, false, true]);
    expect(r.sentences.map((s) => s.isProof)).toEqual([false, false, true, false]);
    expect(r.promiseProof.orphans).toEqual([0, 3]);
  });
  it('GENERIC is all orphans', () => {
    const r = run('GENERIC');
    expect(r.promiseProof.orphans).toEqual(r.sentences.map((s) => s.i));
    expect(r.promiseProof.proofs).toBe(0);
  });
  it('MIXED promises are backed by the next sentence', () => {
    expect(run('MIXED').promiseProof.orphans).toEqual([]);
  });
  it('detects numbers, names, dates and sources as proof', () => {
    const r = analyze('Dr. Lena Ortiz teaches in Room 204. U.S. News ranked us No. 12 in 2025. Classes start in September.');
    expect(r.sentences[0].specifics).toContain('Dr. Lena Ortiz');
    expect(r.sentences[1].specifics).toContain('U.S. News');
    expect(r.sentences.every((s) => !s.swappable)).toBe(true);
  });
});

describe('cliche offsets', () => {
  it('slice to the match on every fixture', () => {
    for (const k of Object.keys(NAMES)) {
      for (const s of run(k).sentences) {
        for (const c of s.cliches) {
          expect(s.text.slice(c.start, c.end)).toBe(c.match);
          expect(c.end).toBeGreaterThan(c.start);
        }
        for (let i = 1; i < s.cliches.length; i++) expect(s.cliches[i].start).toBeGreaterThanOrEqual(s.cliches[i - 1].end);
      }
    }
  });
  it('catches variants', () => {
    const cases = {
      'state-of-the-art': ['state of the art labs', 'State-Of-The-Art facilities'],
      'leaders-of-tomorrow': ["tomorrow's leaders", 'the leaders of tomorrow', 'the next generation of leaders'],
      'world-class': ['world class faculty', 'World-Class'],
      'hands-on': ['hands on learning', 'hands-on experiences'],
      'close-knit': ['tight-knit community', 'close knit'],
      'vibrant-community': ['vibrant campus community', 'Vibrant communities'],
      'more-than-a-number': ['more than just a number'],
    };
    for (const [id, phrases] of Object.entries(cases)) {
      for (const p of phrases) {
        const ids = analyze(`Here is ${p} for you.`).sentences[0].cliches.map((c) => c.id);
        expect(ids, p).toContain(id);
      }
    }
  });
  it('the longest overlapping match wins', () => {
    const c = analyze('Join a tradition of excellence today.').sentences[0].cliches;
    expect(c.map((x) => x.id)).toEqual(['tradition-of-excellence']);
  });
  it('density is hits per 100 words', () => {
    const r = run('GENERIC');
    expect(r.stats.clicheDensity).toBe(Math.round((r.stats.clicheHits / r.stats.words) * 1000) / 10);
  });
});

describe('rivals', () => {
  it('finds shared phrases, overlap, and the rival score', () => {
    const rival = 'Welcome to Southgate College. Our vibrant community and world-class faculty prepare you for the future with hands-on learning.';
    const r = analyze(F.GENERIC, { schoolName: 'Northfield University', rivals: [{ name: 'Southgate College', text: rival }] });
    expect(r.rivals).toHaveLength(1);
    const x = r.rivals[0];
    expect(x.name).toBe('Southgate College');
    expect(x.sharedPhrases.length).toBeGreaterThan(0);
    expect(x.sharedPhrases.length).toBeLessThanOrEqual(12);
    expect(x.sharedPhrases.some((p) => p.includes('vibrant community'))).toBe(true);
    expect(x.sharedPhrases.join(' ')).not.toMatch(/southgate|northfield/);
    expect(x.overlap).toBeGreaterThan(0);
    expect(x.overlap).toBeLessThanOrEqual(1);
    expect(x.score).toBe(analyze(rival, { schoolName: 'Southgate College' }).score);
  });
  it('caps at three rivals and prefers longer phrases', () => {
    const rv = { name: 'R', text: F.GENERIC };
    const r = analyze(F.GENERIC, { rivals: [rv, rv, rv, rv] });
    expect(r.rivals).toHaveLength(3);
    expect(r.rivals[0].overlap).toBe(1);
    expect(r.rivals[0].sharedPhrases.length).toBe(12);
    expect(r.rivals[0].sharedPhrases[0].split(' ')).toHaveLength(4);
  });
  it('unrelated copy has no overlap', () => {
    const r = analyze(F.SPECIFIC, { rivals: [{ name: 'X', text: F.GENERIC }] });
    expect(r.rivals[0].overlap).toBe(0);
  });
});

describe('diagnosis', () => {
  it('flips for high scores', () => {
    expect(['unmistakable', 'breathing']).toContain(run('SPECIFIC').band.id);
    expect(['It Lives.', 'The Unswappable', 'Get Out of the Brochure']).toContain(run('SPECIFIC').diagnosis.title);
  });
  it('uses the dominant cliche when the copy is dead', () => {
    const r = analyze('Our vibrant community is vibrant. A vibrant community awaits. Join our vibrant community.');
    expect(r.diagnosis.title).toBe('Night of the Living Brochure');
  });
  it('has 15-25 distinct pairs', () => {
    const titles = new Set(ALL_DIAGNOSES.map((d) => `${d.title}|${d.tagline}`));
    expect(titles.size).toBeGreaterThanOrEqual(15);
  });
});

describe('voice', () => {
  const strings = [
    ...LEXICON.flatMap((l) => [l.phrase, l.translation, l.fix]),
    ...ALL_DIAGNOSES.flatMap((d) => [d.title, d.tagline]),
    ...[0, 30, 50, 65, 80].map((s) => bandFor(s).verdict),
    ...[0, 30, 50, 65, 80].map((s) => bandFor(s).label),
    analyze('').diagnosis.title, analyze('').diagnosis.tagline,
  ];
  it('no em dashes or en dashes anywhere', () => {
    for (const s of strings) expect(s, s).not.toMatch(DASH);
  });
  it('no banned words in our own voice', () => {
    const ours = [...LEXICON.flatMap((l) => [l.translation, l.fix]), ...ALL_DIAGNOSES.flatMap((d) => [d.title, d.tagline])];
    for (const s of ours) expect(s, s).not.toMatch(/\b(leverage|deep dive|unlock)\b/i);
  });
  it('checkDistinction reasons are dash-free', () => {
    for (const c of ['We have a vibrant community.', 'Founded in 1891 by Ada Kessler.', '', 'Best.']) {
      for (const r of checkDistinction(c, { schoolName: 'Northfield University' }).reasons) expect(r).not.toMatch(DASH);
    }
  });
});

describe('bandFor', () => {
  it('maps the contract thresholds', () => {
    expect(bandFor(0).id).toBe('embalmed');
    expect(bandFor(29).id).toBe('embalmed');
    expect(bandFor(30).id).toBe('haunted');
    expect(bandFor(49).id).toBe('haunted');
    expect(bandFor(50).id).toBe('twitching');
    expect(bandFor(64).id).toBe('twitching');
    expect(bandFor(65).id).toBe('breathing');
    expect(bandFor(79).id).toBe('breathing');
    expect(bandFor(80).id).toBe('unmistakable');
    expect(bandFor(100).id).toBe('unmistakable');
  });
});

describe('checkDistinction', () => {
  const opts = { schoolName: 'Northfield University' };
  const passes = [
    'Every first-year rows on the Kessler River at 6 a.m. in October.',
    'We are the only college in Ohio with a working dairy farm run by 40 students.',
    'The Thursday night lecture has run every week since 1937.',
    'Professor Ana Ruiz takes 22 undergraduates onto Delaware Bay every June.',
  ];
  const fails = [
    'We have a vibrant community.',
    'Northfield University is a great place to learn.',
    'Our world-class faculty are the best.',
    'We prepare leaders of tomorrow.',
    'Innovation.',
  ];
  for (const c of passes) it(`passes: ${c}`, () => {
    const r = checkDistinction(c, opts);
    expect(r.passes).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(60);
  });
  for (const c of fails) it(`fails: ${c}`, () => {
    const r = checkDistinction(c, opts);
    expect(r.passes).toBe(false);
    expect(r.score).toBeLessThan(60);
  });
  it('returns 2-4 reasons, always', () => {
    for (const c of [...passes, ...fails, '', '   ', null, 'x']) {
      const r = checkDistinction(c, opts);
      expect(r.reasons.length).toBeGreaterThanOrEqual(2);
      expect(r.reasons.length).toBeLessThanOrEqual(4);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
  it('calls out the school name as the only specific', () => {
    const r = checkDistinction('Northfield University is a great place to learn.', opts);
    expect(r.reasons.join(' ')).toMatch(/only name in it is yours/);
  });
  it('names the cliche it found', () => {
    expect(checkDistinction('We have a vibrant community.').reasons[0]).toBe("Contains 'vibrant community'. Bad.");
  });
});

describe('sentence splitting', () => {
  it('does not split on abbreviations or decimals', () => {
    expect(splitSentences('Dr. Smith teaches at St. Mary. GPA is 3.5 on average. Go.')).toEqual([
      'Dr. Smith teaches at St. Mary.', 'GPA is 3.5 on average.', 'Go.',
    ]);
  });
  it('breaks on newlines', () => {
    expect(splitSentences('Apply Now\nVisit Campus')).toEqual(['Apply Now', 'Visit Campus']);
  });
});

describe('R11 fixes', () => {
  const N = { schoolName: 'Northfield University' };
  it('MF1: bare numbers are not proof, attached numbers are', () => {
    expect(analyze('123 456 789').score).toBeLessThan(30);
    expect(analyze('4 8 15 16 23 42. 7 11 13 17 19. 2024 2025 2026.').score).toBeLessThan(30);
    expect(analyze('Call 555-123-4567. Zip 90210. Room 101. Code 42.').score).toBeLessThan(30);
    const r = analyze('We have 14 students per class. Admission is rolling 2025.');
    expect(r.sentences[0].isProof).toBe(true);
    expect(r.sentences[1].isProof).toBe(false);
    for (const t of ['31 percent of graduates', '$18,450 after aid', 'running since 1937', 'the Class of 2025', 'a 90-minute exam']) {
      expect(analyze(`It has ${t} here.`).sentences[0].isProof, t).toBe(true);
    }
  });
  it('MF1: a year on every generic sentence does not rescue it', () => {
    const gamed = F.GENERIC.split(/(?<=\.)\s+/).map((s) => s.replace(/\.$/, ' in 2025.')).join(' ');
    expect(analyze(gamed, N).score).toBeLessThan(45);
  });
  it('MF1: real proof copy still scores 85+', () => {
    expect(run('SPECIFIC').score).toBeGreaterThanOrEqual(85);
    expect(run('STATS').score).toBeGreaterThanOrEqual(85);
  });
  it('MF1: HTML tags are stripped and entities decoded', () => {
    const r = analyze('<div class="col-12 mt-4" data-id="98234"><p>We offer a great&nbsp;education.</p></div>');
    expect(r.sentences.map((s) => s.text)).toEqual(['We offer a great education.']);
    expect(r.score).toBeLessThan(50);
  });
  it('MF1: a cliche-heavy text is capped at Twitching', () => {
    const r = analyze('Our world-class faculty of 400 prepare you for the future. 98% of our vibrant community of 12,000 thrives.');
    expect(r.subscores.cliche).toBeLessThan(25);
    expect(r.score).toBeLessThanOrEqual(64);
  });
  it('MF2: bulleted cliches are not proper nouns, whatever the marker', () => {
    for (const m of ['•', '-', '*', '—', '1.']) {
      const r = analyze(`${m} World-class faculty\n${m} Vibrant community\n${m} Hands-on learning`, N);
      expect(r.sentences.map((s) => s.text), m).toEqual(['World-class faculty', 'Vibrant community', 'Hands-on learning']);
      expect(r.sentences.every((s) => s.specifics.length === 0), m).toBe(true);
      expect(['haunted', 'embalmed'], m).toContain(r.band.id);
    }
  });
  it('MF2: inline bullets and Title Case list items split and stay generic', () => {
    const r = analyze('Welcome to our school. • Small Class Sizes • Caring Faculty • Beautiful Campus');
    expect(r.stats.sentences).toBe(4);
    expect(r.sentences.every((s) => s.swappable)).toBe(true);
    expect(r.score).toBeLessThan(50);
  });
  it('MF2: Unicode hyphens are still caught', () => {
    expect(analyze('Our world‑class faculty.').sentences[0].cliches.map((c) => c.id)).toContain('world-class');
  });
  it('MF6: one or two words get diagnosed, not the blank page', () => {
    const r = analyze('Excellence');
    expect(r.cliches.map((c) => c.id)).toEqual(['excellence']);
    expect(r.diagnosis.title).not.toBe('The Blank Page');
    expect(r.score).toBeLessThan(50);
    expect(analyze('World-class faculty').stats.clicheHits).toBe(1);
  });
  it('Amendment 1: sentences[].swapped uses whole-word, escaped name forms', () => {
    const a = analyze('Penn is in Pennsylvania. We love Penn.', { schoolName: 'Penn' });
    expect(a.sentences.map((s) => s.swapped)).toEqual(['Literally Any University is in Pennsylvania.', 'We love Literally Any University.']);
    const b = analyze("St. Mary's (MD) is a vibrant community. Go.", { schoolName: "St. Mary's (MD)" });
    expect(b.sentences[0].swapped).toBe('Literally Any University is a vibrant community.');
    const c = analyze(F.GENERIC, N);
    expect(c.sentences[3].swapped.startsWith('At Literally Any University, you will')).toBe(true);
    expect(c.sentences.map((s) => s.swapped).join(' ')).toBe(c.logoSwap.swappedText);
    expect(analyze(F.MIXED).sentences.every((s) => s.swapped === s.text)).toBe(true);
  });
});
