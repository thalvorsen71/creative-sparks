// Rival Seance: shared phrases and content overlap.
import { splitSentences, contentWords, nameRegex } from './text.js';

function stripNames(text, names) {
  let t = String(text || '');
  for (const n of names) {
    const re = nameRegex(n);
    if (re) t = t.replace(re, ' ');
  }
  return t;
}

// Content-word n-grams, computed within sentences so phrases never straddle a period.
function ngrams(text, n) {
  const out = new Set();
  for (const s of splitSentences(text)) {
    const w = contentWords(s);
    for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '));
  }
  return out;
}

export function sharedPhrases(a, b, max = 12) {
  const picked = [];
  for (const n of [4, 3, 2]) {
    const A = ngrams(a, n);
    const B = ngrams(b, n);
    const common = [...A].filter((g) => B.has(g)).sort();
    for (const g of common) {
      if (picked.length >= max) return picked;
      // prefer longer: skip anything already contained in a picked phrase
      if (picked.some((p) => ` ${p} `.includes(` ${g} `))) continue;
      picked.push(g);
    }
  }
  return picked;
}

export function jaccard(a, b) {
  const A = ngrams(a, 3);
  const B = ngrams(b, 3);
  if (!A.size && !B.size) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  const union = A.size + B.size - inter;
  return union ? Math.round((inter / union) * 1000) / 1000 : 0;
}

export function compareRival(ownText, ownName, rival, analyzeFn) {
  const name = String((rival && rival.name) || 'Rival').trim() || 'Rival';
  const rText = String((rival && rival.text) || '');
  const names = [ownName, name].filter(Boolean);
  const a = stripNames(ownText, names);
  const b = stripNames(rText, names);
  return {
    name,
    score: analyzeFn(rText, { schoolName: name }).score,
    sharedPhrases: sharedPhrases(a, b),
    overlap: jaccard(a, b),
  };
}
