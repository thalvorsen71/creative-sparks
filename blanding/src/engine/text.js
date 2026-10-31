// Text utilities: sentence splitting, tokenizing, school-name handling.

const ABBREVIATIONS = new Set([
  'dr', 'mr', 'mrs', 'ms', 'prof', 'st', 'mt', 'jr', 'sr', 'ft', 'rev', 'gen', 'sen', 'rep', 'gov',
  'u.s', 'u.k', 'e.g', 'i.e', 'vs', 'no', 'inc', 'co', 'corp', 'dept', 'univ', 'approx', 'jan', 'feb',
  'mar', 'apr', 'aug', 'sept', 'sep', 'oct', 'nov', 'dec', 'ph.d', 'b.a', 'b.s', 'm.a', 'm.s', 'a.m', 'p.m',
]);

export function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function hasContent(s) {
  return /[\p{L}\p{N}]/u.test(String(s || ''));
}

// Split into sentences. Newlines always break (headlines rarely end in periods).
export function splitSentences(text) {
  const out = [];
  for (const line of String(text || '').split(/\r?\n+/)) {
    const chunk = line.trim();
    if (!chunk) continue;
    const re = /([.!?]+)(["'”’)\]]*)(\s+)(?=["'“‘(\[]?[\p{Lu}\p{N}])/gu;
    let start = 0;
    let m;
    while ((m = re.exec(chunk))) {
      const before = chunk.slice(start, m.index);
      const lastWord = (before.match(/(\S+)$/) || ['', ''])[1].toLowerCase();
      const isAbbrev = m[1] === '.' && (ABBREVIATIONS.has(lastWord) || /^\p{L}$/u.test(lastWord) || /^(?:\p{L}\.)+\p{L}$/u.test(lastWord));
      if (isAbbrev) continue;
      out.push(chunk.slice(start, m.index + m[1].length + m[2].length).trim());
      start = m.index + m[0].length;
    }
    out.push(chunk.slice(start).trim());
  }
  return out.filter(hasContent);
}

export function words(text) {
  return String(text || '').match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];
}

export const STOPWORDS = new Set(`a an the and or but nor so yet for of in on at to from by with without into onto upon
about above below over under between among through during before after since until while as than then
is am are was were be been being have has had having do does did doing will would shall should can could may might must
i me my mine we us our ours you your yours he him his she her hers it its they them their theirs this that these those
who whom whose which what where when why how all any both each every few more most other some such no not only own same
too very just also here there now ever even still again further once s t don't can't won't it's we're you're you'll we'll
there's that's let's get gets got make makes made way ways one ones many much well like across within around
student students school schools university universities college colleges campus`.split(/\s+/));

// Lowercase content words, hyphens split, apostrophes dropped. Used for rivals.
export function contentWords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w && !STOPWORDS.has(w) && w.length > 1);
}

// Name forms to swap/ignore. Full name, plus the bare stem if the name ends in University/College/etc.
export function nameForms(schoolName) {
  const name = String(schoolName || '').trim().replace(/\s+/g, ' ');
  if (!name || !hasContent(name)) return [];
  const forms = [name];
  const m = name.match(/^(.+?)\s+(?:University|College|Institute|Polytechnic|School)$/i);
  if (m && m[1].length >= 3 && !/^(?:the|state)$/i.test(m[1])) forms.push(m[1]);
  return forms.sort((a, b) => b.length - a.length);
}

export function nameRegex(schoolName) {
  const forms = nameForms(schoolName);
  if (!forms.length) return null;
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${forms.map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`, 'giu');
}
