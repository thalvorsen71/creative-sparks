// Blanding 3.0 engine. Contract: org/CONTRACT.md. Pure, deterministic, no DOM, no network.
import { LEXICON, LEXICON_INDEX } from './lexicon.js';
import { splitSentences, words as wordList, nameRegex, hasContent } from './text.js';
import { findCliches, findSpecifics, isPromise } from './detect.js';
import { diagnose } from './titles.js';
import { compareRival } from './rivals.js';
import { checkDistinction } from './distinction.js';

export { LEXICON, checkDistinction };

export const SWAP_NAME = 'Literally Any University';
export const MIN_WORDS = 3;

const BANDS = [
  [80, 'unmistakable', 'Unmistakable', 'Nobody else could have written this. Frame it.'],
  [65, 'breathing', 'Breathing', 'A pulse. Faint, but legally a pulse.'],
  [50, 'twitching', 'Twitching', 'Something moved. Could have been the wind.'],
  [30, 'haunted', 'Haunted', 'The copy is dead. It just does not know it yet.'],
  [0, 'embalmed', 'Embalmed', 'Technically present. Clinically indistinguishable.'],
];

export function bandFor(score) {
  const s = Number.isFinite(score) ? score : 0;
  const [, id, label, verdict] = BANDS.find(([min]) => s >= min) || BANDS[BANDS.length - 1];
  return { id, label, verdict };
}

// Scoring weights. See engine.test.js for the calibration table these were tuned against.
export const WEIGHTS = {
  base: 31,          // a page of words with nothing wrong and nothing right still exists
  positive: 0.43,    // specificity + swap, the "is this yours" signal
  positiveCurve: 1.5,// convex: half-specific copy earns well under half the credit
  proof: 0.08,
  cliche: 0.14,
  specShare: 0.55,   // within positive
  clicheDecay: 16,   // severity points per 100 words that cost ~63% of the cliche subscore
  nextSentenceProof: 0.6, // proof one sentence later counts, but less
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function emptyReport(text, opts) {
  return {
    score: 0,
    band: bandFor(0),
    subscores: { cliche: 0, specificity: 0, proof: 0, swap: 0 },
    stats: { words: 0, sentences: 0, clicheHits: 0, clicheDensity: 0 },
    sentences: [],
    cliches: [],
    logoSwap: { swapName: SWAP_NAME, swappedText: String(text || '').trim(), survivors: [], total: 0 },
    promiseProof: { promises: 0, proofs: 0, orphans: [] },
    rivals: [],
    diagnosis: { title: 'The Blank Page', tagline: 'In an empty text box, no one can hear you scream.' },
  };
}

// A cliche dominates if it repeats and beats the runner-up, or if it is the only one.
function dominantCliche(cliches) {
  if (!cliches.length) return null;
  if (cliches.length === 1) return cliches[0].id;
  return cliches[0].count >= 2 && cliches[0].count > cliches[1].count ? cliches[0].id : null;
}

function core(text, opts) {
  const o = opts && typeof opts === 'object' ? opts : {};
  const clean = typeof text === 'string' ? text.trim() : String(text ?? '').trim();
  // Fewer than three words is a fragment, not copy. Score 0 rather than pretend.
  if (!hasContent(clean) || wordList(clean).length < MIN_WORDS) return emptyReport(clean, o);

  const nameRe = nameRegex(o.schoolName);
  const raw = splitSentences(clean);

  const sentences = raw.map((t, i) => {
    const cliches = findCliches(t);
    const spec = findSpecifics(t, nameRe);
    return {
      i,
      text: t,
      cliches,
      isPromise: isPromise(t, cliches.length),
      isProof: spec.strong >= 1,
      specifics: spec.tokens,
      swappable: spec.strong < 0.75 && spec.weight < 1,
      _w: wordList(t).length,
      _spec: spec,
    };
  });

  const wordCount = wordList(clean).length;
  const n = sentences.length;

  // ---- cliches ----
  const counts = new Map();
  let hits = 0;
  let sevSum = 0;
  for (const s of sentences) for (const c of s.cliches) {
    hits++;
    counts.set(c.id, (counts.get(c.id) || 0) + 1);
    sevSum += LEXICON[LEXICON_INDEX[c.id]].severity;
  }
  const cliches = [...counts.entries()]
    .map(([id, count]) => {
      const l = LEXICON[LEXICON_INDEX[id]];
      return { id, phrase: l.phrase, count, translation: l.translation, fix: l.fix, severity: l.severity };
    })
    .sort((a, b) => b.count - a.count || b.severity - a.severity || LEXICON_INDEX[a.id] - LEXICON_INDEX[b.id]);
  const sevPer100 = wordCount ? (sevSum / wordCount) * 100 : 0;
  const clicheSub = Math.round(100 * Math.exp(-sevPer100 / WEIGHTS.clicheDecay));

  // ---- specificity: word-weighted share of sentences carrying enough detail for their length ----
  let specNum = 0;
  let specDen = 0;
  for (const s of sentences) {
    const target = Math.max(1.5, s._w / 9);
    specNum += Math.min(1, s._spec.weight / target) * s._w;
    specDen += s._w;
  }
  const specSub = specDen ? Math.round((100 * specNum) / specDen) : 0;

  // ---- promise vs proof ----
  const orphans = [];
  let backed = 0;
  let promises = 0;
  sentences.forEach((s, i) => {
    if (!s.isPromise) return;
    promises++;
    if (s.isProof) backed += 1;
    else if (sentences[i + 1] && sentences[i + 1].isProof) backed += WEIGHTS.nextSentenceProof;
    else orphans.push(i);
  });
  const proofs = sentences.filter((s) => s.isProof).length;
  const proofSub = promises ? Math.round((100 * backed) / promises) : (proofs ? 100 : 50);

  // ---- logo swap ----
  const survivors = sentences.filter((s) => s.swappable).map((s) => s.i);
  const swapSub = n ? Math.round(100 * (1 - survivors.length / n)) : 0;

  // ---- score ----
  const positiveLinear = WEIGHTS.specShare * specSub + (1 - WEIGHTS.specShare) * swapSub;
  const positive = 100 * Math.pow(positiveLinear / 100, WEIGHTS.positiveCurve);
  let score = WEIGHTS.base + WEIGHTS.positive * positive + WEIGHTS.proof * proofSub + WEIGHTS.cliche * clicheSub;
  const pureProof = n > 0 && hits === 0 && sentences.every((s) => s.isProof) && specSub === 100;
  score = Math.round(clamp(score, 1, pureProof ? 100 : 99));

  const band = bandFor(score);
  const swappedText = nameRe ? clean.replace(nameRe, SWAP_NAME) : clean;

  return {
    score,
    band,
    subscores: { cliche: clicheSub, specificity: specSub, proof: proofSub, swap: swapSub },
    stats: {
      words: wordCount,
      sentences: n,
      clicheHits: hits,
      clicheDensity: wordCount ? Math.round((hits / wordCount) * 1000) / 10 : 0,
    },
    sentences: sentences.map(({ _w, _spec, ...s }) => s),
    cliches,
    logoSwap: { swapName: SWAP_NAME, swappedText, survivors, total: n },
    promiseProof: { promises, proofs, orphans },
    rivals: [],
    diagnosis: diagnose(band.id, dominantCliche(cliches), String(wordCount)),
  };
}

export function analyze(text = '', opts = {}) {
  const report = core(text, opts);
  const o = opts && typeof opts === 'object' ? opts : {};
  if (report.stats.words && Array.isArray(o.rivals)) {
    report.rivals = o.rivals
      .filter((r) => r && typeof r === 'object')
      .slice(0, 3)
      .map((r) => compareRival(text, o.schoolName, r, core));
  }
  return report;
}
