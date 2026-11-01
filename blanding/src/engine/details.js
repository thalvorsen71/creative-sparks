import { findCliches } from './detect.js';

// Distinctive details: mechanisms, structures, named programs, requirements, places, firsts.
// The T0 lesson: a big number or a proper noun alone is NOT a distinctive detail. It has to say
// how something here works, what every student does, where it happens, or what you did first.

// Things people do together: these are programs, whether or not anything else is said.
const ORG = 'Society|Club|Program|Programme|Institute|Project|Initiative|Fellowship|Scholars|Team|Band|Choir|Chorus|Orchestra|Ensemble|Press|Review|Journal|Seminar|Prize|Lecture|Series|Clinic|Academy|Workshop|Expedition|Challenge|Cup|Bowl|Festival|Corps|League|Brigade|Squad|Collective|Cooperative|Co-op|Course|Curriculum|Fund|Guarantee|Promise|Pledge';
const ORG_RE = new RegExp(`\\b(?:${ORG})s?\\b`);
// Buildings and facilities. A name on a building is not a program. It counts as a place only
// when the sentence says what happens there.
const FACILITY_RE = /\b(?:Hall|House|Center|Centre|Library|Museum|Theater|Theatre|Studio|Quad|Union|Commons|Building|Complex|Arena|Stadium|Gym|Gymnasium|Pavilion|Plaza|Tower|Chapel|Court|Field|Lab|Laboratory|Station|Farm|Garden|Observatory|Forest|Reserve|Preserve|Trail)s?\b/;
// "Something happens there": a person doing a thing, or a concrete operating verb.
const ACTIVITY = /\b(?:students?|first-years?|freshm[ae]n|seniors?|juniors?|sophomores?|undergraduates?|majors|we|they|faculty|classes|crews?|teams?)\s+(?:[\w'\u2019-]+\s+){0,2}?(?:spend|spends|spent|live|lives|work|works|row|rows|study|studies|train|trains|build|builds|built|run|runs|ran|meet|meets|perform|performs|sail|sails|dig|digs|test|tests|track|tracks|tracked|grow|grows|cook|cooks|teach|teaches|take|takes|dive|dives|count|counts|survey|surveys|map|maps|fly|flies|launch|launches|restore|restores)\b|\b(?:tracked|surveyed|mapped|counted|restored|planted|launched|dug|sailed|rowed)\b|\bwith its own\b/i;
// Amenities, retail and paperwork. Never a lede, never "a real mechanism".
export const TRIVIA = /\b(?:register|registration|deadlines?|due by|forms?|fees?|parking|permits?|submit|FAFSA|deposit|transcripts?|immunizations?|ID cards?|bookstore|sales?|discounts?|coupons?|Starbucks|Chick-fil-A|Panera|Subway|Dunkin|food court|dining hall|caf[eé]s?|coffee|T-shirts?|merch|wi-?fi|vending|laundry|shuttle|vending)\b/i;
// Site tools and nav labels pasted along with the copy. "Program Finder" is a search box, not a program.
const NAV_TERMS = /\b(?:Finder|Portal|Dashboard|Directory|Search|Catalog|Virtual Tour|Request Info|Apply Now|Login|Log In|Sign In|Menu)\b/i;
const UI_VERB_BEFORE = /\b(?:use|explore|view|visit|try|browse|search|find|open|click|download|access|check out|request)\s+(?:our\s+|the\s+|this\s+|a\s+)?$/i;
const UI_VERB_START = /^(?:View|Explore|Use|Find|Apply|Visit|Request|Learn|Browse|Search|Download|Click|Discover|Get|Start|Schedule|Register)\b/;
// Someone's backstory: a class year or a personal pronoun. An organization they joined is theirs, not yours.
const PERSON = /[\u2019']\d{2}\b|\b(?:he|she|his|her|alumna|alumnus)\b/i;
const THIRD_PARTY_INTRO = /\b(?:with|for|through|at|in|after|from|joined|joining|joins)\s+(?:the\s+|a\s+)?$/i;
const POSSESSED = /\p{Lu}[\p{L}]*['\u2019]s\s+$/u;
// Student groups and recurring events: the name itself says people do something.
const ACTIVITY_GROUP = /\b(?:Society|Club|Team|Band|Choir|Chorus|Orchestra|Ensemble|League|Squad|Brigade|Collective|Cooperative|Co-op|Expedition|Festival|Lecture|Series|Seminar|Workshop|Clinic|Course)s?\b/;
// A clause that starts mid-thought ("and certificate programs...") is a fragment.
const FRAGMENT_START = /^(?:and|or|but|nor|with|from|to|of|for|in|on|at|including|plus|as well as|such as)\b/i;
const GEO_RE = /\b(?:Bay|River|Lake|Mountains?|Island|Street|Avenue|Coast|Gulf|Point|Valley|County|Harbor|Harbour|Sound|Canyon|Desert|Ocean|Sea|Creek|Falls|Peninsula|Prairie|Delta)\b/;

// Nouns too generic to be a "first" or an "only".
const GENERIC_NOUNS = new Set(`school college university institution place campus community program programs
student students experience education choice option one way home family opportunity people faculty environment
destination leader leaders provider name thing kind type choice best top time year years step steps day days semester
generation class classes`.split(/\s+/).filter(Boolean));
const STOP_AFTER = /^(?:that|which|who|where|in|to|of|with|for|at|on|by|and|or|but|is|are|was|were|we|you|it|this|from|than|as)$/i;

const MECH_VERB = /\b(?:tracked|tracks|built|builds|launched|operates|hosts|rows|rowed|milks?|digs?|dug|restores?|restored|plants?|planted|surveys?|surveyed|mapped|counted|counts|published|sails?|sailed|brews?|tests?|tested|ran|runs|grades?|graded|spend|spends|work|works|meet|meets|perform|performs|compete|competes|travel|travels|serve|serves)\b(?!\s+to\b)/i;

const PATTERNS = [
  // requirement: what every student does
  { kind: 'requirement', w: 3, re: /\b(?:every|each|all)\s+(?:[\w'’-]+\s+){0,3}?(?:student|students|first-years?|freshm[ae]n|seniors?|juniors?|sophomores?|graduates?|majors?|undergraduates?)\s+(?:must\s+|is required to\s+|are required to\s+)?(?:reads?|takes?|completes?|writes?|spends?|lives?|defends?|presents?|studies|study|rows?|builds?|publishes?|performs?|works?|serves?|signs?|learns?|travels?|designs?|runs?|teaches?)\b/i },
  { kind: 'requirement', w: 2.75, re: /\b(?:ends|begins|starts|culminates|opens|closes) with (?:a|an|the|one)\b/i },
  // "must" alone is a rule, not a lede ("must register by August 1"). Weight below the lede threshold.
  { kind: 'requirement', w: 1.5, re: /\b(?:is required|are required|must|(?:is|are) not allowed to|may not|cannot graduate without|graduation requires)\b/i, needsDetail: true },
  // structure: how learning is organized
  { kind: 'structure', w: 3, re: /\bno (?:majors|lectures|grades|letter grades|exams|tests|departments|textbooks|tenure|required courses)\b/i },
  { kind: 'structure', w: 3, re: /\b(?:classes (?:are|have|average|cap at|top out at) \d+|\d+ students (?:around|per|in each|at)|one (?:course|class) at a time|block plan)\b/i },
  { kind: 'structure', w: 2.5, re: /\b(?:oral exams?|senior thesis|thesis|capstone|tutorials?|great books|co-?op (?:rotation|semester|program)|residential college|cohorts? of \d+)\b/i },
  { kind: 'structure', w: 2.75, re: /\b(?:clinical rotations?|(?:in|during) their first (?:semester|year|week|month)|instead of (?:in )?their (?:second|third|fourth|senior|junior)|within \d+ (?:hours|days)|on day one)\b/i },
  // policy: published terms anyone can check
  { kind: 'policy', w: 3, re: /\b(?:pay(?:s)? no tuition|tuition-free|free tuition|no-loan|meets? (?:full|100 percent of|100% of) (?:demonstrated )?need|we cover (?:full )?tuition|guarantee(?:s|d)? (?:admission|a spot|housing|an internship|aid))\b/i },
  // Softer policy words count only with a concrete term attached: a threshold, a named partner, a number.
  { kind: 'policy', w: 3, re: /\b(?:covers? (?:full )?tuition|guaranteed (?:transfer|admission)|transfer agreements?|pledges?)\b/i, needsStrong: true },
  // ritual: something that happens on a schedule, with a start date
  { kind: 'ritual', w: 2.75, re: /\b(?:every (?:week|year|night|morning|spring|fall|semester|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|each (?:week|year|spring|fall))\b[^.!?]{0,60}\bsince \d{4}\b|\bsince \d{4}\b[^.!?]{0,60}\bevery (?:week|year|night)\b|\bhas run every\b/i },
  // mechanism: a concrete thing that actually happens
  { kind: 'mechanism', w: 2.5, re: /\b(?:tracked|tracks|built|builds|launched|operates|hosts|rows|rowed|milks?|digs?|dug|restores?|restored|plants?|planted|surveys?|surveyed|mapped|counted|counts|published|designed|sails?|sailed|brews?|tests?|tested|ran|runs|grades?|graded|returns?)\b/i, needsDetail: true },
];

// "the only collegiate falconry team", "the first public university to ...": a first, if the noun is real.
const FIRST_RE = /\b(?:the|our|its|their|america's|the nation's|the country's|the world's|the state's)\s+(only|first|oldest|largest|last|sole)\s+((?:[\w'’-]+\s*){1,5})/gi;

function wholeSentence(text) {
  const ws = text.trim().replace(/[.!?]+$/, '').split(/\s+/);
  return ws.length > 16 ? `${ws.slice(0, 16).join(' ')}...` : ws.join(' ');
}

function clauseAround(text, start, end) {
  const seps = /,(?!\d{3})|[;:()]|\s[–—]\s/g;
  let a = 0;
  let b = text.length;
  let m;
  while ((m = seps.exec(text))) {
    if (m.index < start) a = m.index + m[0].length;
    else if (m.index >= end) { b = m.index; break; }
  }
  let clause = text.slice(a, b).trim().replace(/[.!?]+$/, '');
  if (FRAGMENT_START.test(clause)) return wholeSentence(text);
  const ws = clause.split(/\s+/);
  // A clause under five words is a fragment ("Every year since 1985"). Use the sentence.
  if (ws.length < 5) return wholeSentence(text);
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
  // Coffee, parking and paperwork: real, checkable, and not why anyone enrolls.
  const active = ACTIVITY.test(t);

  const person = PERSON.test(t);
  const happens = active || MECH_VERB.test(t) || PATTERNS[0].re.test(t);
  for (const tok of spec.tokens || []) {
    if (!/\p{Lu}/u.test(tok)) continue;
    const at = t.indexOf(tok);
    const before = at > 0 ? t.slice(0, at) : '';
    // Site tools, nav labels, and other organizations in someone's backstory are not your detail.
    if (NAV_TERMS.test(tok) || UI_VERB_START.test(tok) || UI_VERB_BEFORE.test(before)) continue;
    if (POSSESSED.test(before) || (person && THIRD_PARTY_INTRO.test(before))) continue;
    const withThe = at >= 4 && /the $/i.test(t.slice(at - 4, at)) ? `the ${tok}` : tok;
    if (ORG_RE.test(tok)) out.push({ kind: 'named program', w: 3, start: Math.max(0, at), detail: withThe, strong: ACTIVITY_GROUP.test(tok) || happens });
    else if (FACILITY_RE.test(tok)) { if (active) out.push({ kind: 'place', w: 3, start: Math.max(0, at), detail: withThe }); }
    else if (GEO_RE.test(tok)) { if (active) out.push({ kind: 'place', w: 2, start: Math.max(0, at), detail: withThe }); }
  }
  for (const p of PATTERNS) {
    if (p.needsDetail && !hasDetail) continue;
    if (p.needsStrong && !(spec.strong >= 1)) continue;
    const m = p.re.exec(t);
    if (!m) continue;
    // "designed to ignite your ambition" is a purpose phrase, not a mechanism.
    if (p.kind === 'mechanism' && /^\s+to\b/i.test(t.slice(m.index + m[0].length))) continue;
    out.push({ kind: p.kind, w: p.w, start: m.index, detail: clauseAround(t, m.index, m.index + m[0].length) });
  }
  out.push(...firstCandidates(t));
  // Coffee, parking and paperwork: drop the details that are about them, not the whole sentence
  // ("the dining hall serves what they grow" must not veto the Kessler Farm).
  // A detail that contains a cliche, or reads as a nav label, is not a detail.
  const kept = out.filter((c) => !TRIVIA.test(c.detail) && !NAV_TERMS.test(c.detail) && findCliches(c.detail).length === 0)
    .map((c) => ({ ...c, strong: c.strong ?? true }));
  out.length = 0; out.push(...kept);
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
  place: 'a real place, and the sentence says what happens there',
  policy: 'a published policy, with terms anyone can check',
  first: 'a first, which a rival would have to disprove',
};
