// STUB ENGINE. Returns the exact shape in org/CONTRACT.md so UI + Poster lanes can build today.
// The Engine lane replaces the internals. Do not change the exported signatures.

export const LEXICON = [
  { id: 'vibrant-community', phrase: 'vibrant community', patterns: [/vibrant (campus )?community/gi],
    translation: 'There are people here.', fix: 'Name the club, the night, the headcount.', severity: 3 },
  { id: 'world-class', phrase: 'world-class', patterns: [/world[- ]class/gi],
    translation: 'We have not been ranked for this.', fix: 'Cite who said so, or delete it.', severity: 3 },
];

const BANDS = [
  [80, 'unmistakable', 'Unmistakable', 'Nobody else could have written this. Frame it.'],
  [65, 'breathing', 'Breathing', 'A pulse. Faint, but legally a pulse.'],
  [50, 'twitching', 'Twitching', 'Something moved. Could have been the wind.'],
  [30, 'haunted', 'Haunted', 'The copy is dead. It just does not know it yet.'],
  [0, 'embalmed', 'Embalmed', 'Technically present. Clinically indistinguishable.'],
];
export function bandFor(score) {
  const [, id, label, verdict] = BANDS.find(([min]) => score >= min);
  return { id, label, verdict };
}

export function analyze(text = '', opts = {}) {
  const swapName = 'Literally Any University';
  const clean = String(text || '').trim();
  const raw = clean ? clean.split(/(?<=[.!?])\s+/) : [];
  const sentences = raw.map((t, i) => {
    const cliches = [];
    for (const l of LEXICON) for (const p of l.patterns) {
      p.lastIndex = 0; let m;
      while ((m = p.exec(t))) cliches.push({ id: l.id, match: m[0], start: m.index, end: m.index + m[0].length });
    }
    const isProof = /\d/.test(t);
    return { i, text: t, cliches, isPromise: /\b(we|you will|prepare)\b/i.test(t), isProof,
      specifics: (t.match(/\d[\d,.%]*/g) || []), swappable: !isProof };
  });
  const hits = sentences.reduce((s, x) => s + x.cliches.length, 0);
  const words = clean ? clean.split(/\s+/).length : 0;
  const score = clean ? Math.max(5, Math.min(95, 60 - hits * 8 + sentences.filter(s => s.isProof).length * 6)) : 0;
  const cliches = LEXICON.map(l => ({ id: l.id, phrase: l.phrase, translation: l.translation, fix: l.fix, severity: l.severity,
    count: sentences.reduce((s, x) => s + x.cliches.filter(c => c.id === l.id).length, 0) }))
    .filter(c => c.count).sort((a, b) => b.count - a.count);
  const survivors = sentences.filter(s => s.swappable).map(s => s.i);
  const re = opts.schoolName ? new RegExp(opts.schoolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : null;
  return {
    score,
    band: bandFor(score),
    subscores: { cliche: 50, specificity: 50, proof: 50, swap: sentences.length ? Math.round(100 * (1 - survivors.length / sentences.length)) : 0 },
    stats: { words, sentences: sentences.length, clicheHits: hits, clicheDensity: words ? Math.round((hits / words) * 1000) / 10 : 0 },
    sentences,
    cliches,
    logoSwap: { swapName, swappedText: re ? clean.replace(re, swapName) : clean, survivors, total: sentences.length },
    promiseProof: { promises: sentences.filter(s => s.isPromise).length, proofs: sentences.filter(s => s.isProof).length,
      orphans: sentences.filter(s => s.isPromise && !s.isProof).map(s => s.i) },
    rivals: (opts.rivals || []).map(r => ({ name: r.name, score: 50, sharedPhrases: ['vibrant community'], overlap: 0.2 })),
    diagnosis: { title: 'The Sixth Sentence', tagline: 'I see dead copy.' },
  };
}

export function checkDistinction(claim = '', opts = {}) {
  const has = /\d|[A-Z][a-z]+ [A-Z]/.test(claim);
  return { score: has ? 70 : 30, passes: has, reasons: [has ? 'Contains something specific. Good.' : 'Any school could say this.'] };
}
