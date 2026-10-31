// Distinctive details: mechanisms, structures, named programs, requirements, places, firsts.
// The T0 lesson: a big number or a proper noun alone is NOT a distinctive detail. It has to say
// how something here works, what every student does, where it happens, or what you did first.

const ORG = 'Society|Club|Program|Programme|Institute|Center|Centre|Lab|Laboratory|Station|Project|Initiative|Fellowship|Scholars|Team|Band|Choir|Chorus|Orchestra|Ensemble|Press|Review|Journal|Farm|Garden|Museum|Library|Observatory|Seminar|Prize|Lecture|Series|Studio|Theater|Theatre|Clinic|Academy|Workshop|Expedition|Challenge|Cup|Bowl|Festival|Trail|Forest|Reserve|Preserve|Hall|House|Corps|League|Brigade|Squad|Collective|Cooperative|Co-op';
const ORG_RE = new RegExp(`\\b(?:${ORG})s?\\b`);
const GEO_RE = /\b(?:Bay|River|Lake|Mountains?|Island|Street|Avenue|Coast|Gulf|Point|Valley|County|Harbor|Harbour|Sound|Canyon|Desert|Ocean|Sea|Creek|Falls|Peninsula|Prairie|Delta)\b/;

// Nouns too generic to be a "first" or an "only".
const GENERIC_NOUNS = new Set(`school college university institution place campus community program programs
student students experience education choice option one way home family opportunity people faculty environment
destination leader leaders provider name thing kind type choice best top time year years step steps day days semester
generation class classes`.split(/\s+/).filter(Boolean));
const STOP_AFTER = /^(?:that|which|who|where|in|to|of|with|for|at|on|by|and|or|but|is|are|was|were|we|you|it|this|from|than|as)$/i;

const PATTERNS = [
  // requirement: what every student does
  { kind: 'requirement', w: 3, re: /\b(?:every|each|all)\s+(?:[\w'’-]+\s+){0,3}?(?:student|students|first-years?|freshm[ae]n|seniors?|juniors?|sophomores?|graduates?|majors?|undergraduates?)\s+(?:must\s+|is required to\s+|are required to\s+)?(?:reads?|takes?|completes?|writes?|spends?|lives?|defends?|presents?|studies|study|rows?|builds?|publishes?|performs?|works?|serves?|signs?|learns?|travels?|designs?|runs?|teaches?)\b/i },
  { kind: 'requirement', w: 2.75, re: /\b(?:ends|begins|starts|culminates|opens|closes) with (?:a|an|the|one)\b/i },
  { kind: 'requirement', w: 2.5, re: /\b(?:is required|are required|must|(?:is|are) not allowed to|may not|cannot graduate without|graduation requires)\b/i, needsDetail: true },
  // structure: how learning is organized
  { kind: 'structure', w: 3, re: /\bno (?:majors|lectures|grades|letter grades|exams|tests|departments|textbooks|tenure|required courses)\b/i },
  { kind: 'structure', w: 3, re: /\b(?:classes (?:are|have|average|cap at|top out at) \d+|\d+ students (?:around|per|in each|at)|one (?:course|class) at a time|block plan)\b/i },
  { kind: 'structure', w: 2.5, re: /\b(?:oral exams?|senior thesis|thesis|capstone|tutorials?|great books|co-?op (?:rotation|semester|program)|residential college|cohorts? of \d+)\b/i },
  // ritual: something that happens on a schedule, with a start date
  { kind: 'ritual', w: 2.75, re: /\b(?:every (?:week|year|night|morning|spring|fall|semester|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|each (?:week|year|spring|fall))\b[^.!?]{0,60}\bsince \d{4}\b|\bsince \d{4}\b[^.!?]{0,60}\bevery (?:week|year|night)\b|\bhas run every\b/i },
  // mechanism: a concrete thing that actually happens
  { kind: 'mechanism', w: 2.5, re: /\b(?:tracked|tracks|built|builds|launched|operates|hosts|rows|rowed|milks?|digs?|dug|restores?|restored|plants?|planted|surveys?|surveyed|mapped|counted|counts|published|designed|sails?|sailed|brews?|tests?|tested|ran|runs)\b/i, needsDetail: true },
];

// "the only collegiate falconry team", "the first public university to ...": a first, if the noun is real.
const FIRST_RE = /\b(?:the|our|its|their|america's|the nation's|the country's|the world's|the state's)\s+(only|first|oldest|largest|last|sole)\s+((?:[\w'’-]+\s*){1,5})/gi;

function clauseAround(text, start, end) {
  const seps = /[,;:()]|\s[–—]\s/g;
  let a = 0;
  let b = text.length;
  let m;
  while ((m = seps.exec(text))) {
    if (m.index < start) a = m.index + m[0].length;
    else if (m.index >= end) { b = m.index; break; }
  }
  let clause = text.slice(a, b).trim().replace(/[.!?]+$/, '');
  const ws = clause.split(/\s+/);
  if (ws.length > 16) clause = `${ws.slice(0, 16).join(' ')}...`;
  return clause;
}

function firstCandidates(text) {
  const out = [];
  FIRST_RE.lastIndex = 0;
  let m;
  while ((m = FIRST_RE.exec(text))) {
    const words = [];
    for (const w of m[2].trim().split(/\s+/)) {
      const c = w.replace(/[^\w'-]/g, '');
      if (!c || STOP_AFTER.test(c)) break;
      words.push(c);
      if (/[,.;:!?]$/.test(w)) break;
    }
    const lower = words.map((w) => w.toLowerCase());
    if (!lower.length || /^(?:year|years|step|day|time|semester|generation)$/.test(lower[0])) continue;
    const real = lower.filter((w) => !GENERIC_NOUNS.has(w) && w.length > 2);
    if (!real.length) continue;
    const phrase = `${m[1].toLowerCase()} ${words.join(' ')}`;
    out.push({ kind: 'first', w: 3, start: m.index, detail: `${m[0].split(/\s+/)[0].toLowerCase() === 'the' ? 'the ' : ''}${phrase}`.trim(), phrase });
  }
  return out;
}

// spec: findSpecifics() result for this sentence (tokens incl. proper-noun runs).
// Returns candidates sorted best first: { kind, w, start, detail }.
export function findDetails(text, spec = { tokens: [], weight: 0, strong: 0, concrete: 0 }) {
  const t = String(text || '');
  const out = [];
  const hasDetail = spec.weight >= 0.5 || spec.concrete > 0;

  for (const tok of spec.tokens || []) {
    if (!/\p{Lu}/u.test(tok)) continue;
    const at = t.indexOf(tok);
    const withThe = at >= 4 && /the $/i.test(t.slice(at - 4, at)) ? `the ${tok}` : tok;
    if (ORG_RE.test(tok)) out.push({ kind: 'named program', w: 3, start: Math.max(0, at), detail: withThe });
    else if (GEO_RE.test(tok)) out.push({ kind: 'place', w: 2, start: Math.max(0, at), detail: withThe });
  }
  for (const p of PATTERNS) {
    if (p.needsDetail && !hasDetail) continue;
    const m = p.re.exec(t);
    if (m) out.push({ kind: p.kind, w: p.w, start: m.index, detail: clauseAround(t, m.index, m.index + m[0].length) });
  }
  out.push(...firstCandidates(t));
  out.sort((a, b) => b.w - a.w || a.start - b.start);
  return out;
}

// One number per sentence: best kind, plus a little for each extra kind.
export function detailScore(cands) {
  if (!cands.length) return 0;
  const kinds = new Set(cands.map((c) => c.kind));
  return cands[0].w + 0.25 * (kinds.size - 1);
}

export const KIND_PHRASE = {
  'named program': 'a named program, not an adjective',
  requirement: 'a requirement, something every student actually does',
  structure: 'a structure: it says how learning works here',
  ritual: 'a ritual with a start date',
  mechanism: 'a thing that actually happens, with a who and a what',
  place: 'a real place you could find on a map',
  first: 'a first, which a rival would have to disprove',
};
