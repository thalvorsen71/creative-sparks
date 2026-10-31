// Per-sentence detection: cliches, specifics, promises, proof.
import { LEXICON, LEXICON_INDEX } from './lexicon.js';

// ---------- Cliches ----------

export function findCliches(text) {
  const found = [];
  for (const l of LEXICON) {
    for (const p of l.patterns) {
      p.lastIndex = 0;
      let m;
      while ((m = p.exec(text))) {
        if (!m[0]) { p.lastIndex++; continue; }
        found.push({ id: l.id, match: m[0], start: m.index, end: m.index + m[0].length, sev: l.severity });
      }
    }
  }
  // Longest match wins an overlap; ties go to higher severity, then lexicon order.
  found.sort((a, b) => (b.end - b.start) - (a.end - a.start) || b.sev - a.sev
    || LEXICON_INDEX[a.id] - LEXICON_INDEX[b.id] || a.start - b.start);
  const kept = [];
  for (const f of found) {
    if (!kept.some((k) => f.start < k.end && k.start < f.end)) kept.push(f);
  }
  kept.sort((a, b) => a.start - b.start);
  return kept.map(({ id, match, start, end }) => ({ id, match, start, end }));
}

// ---------- Specifics ----------

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
const DAYS = 'Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday';
const DATE_RE = new RegExp(`^(?:${MONTHS}|${DAYS})s?$`);

// Capitalized words that are not, by themselves, anybody's specifics.
const GENERIC_CAPS = new Set(`
the our at in on of for and to a an as by from with into through this these that those it its we you your i
here there welcome join apply visit learn more discover explore find start begin get today now every each
when whether while if why how what where who all some many most one
university college school institute campus faculty admissions admission office honors program programs center
centre department student students life career careers services studies arts art sciences science liberal business
engineering alumni graduate graduates undergraduate undergraduates professional education research community
academics academic excellence innovation leadership leaders success future tomorrow world global society
stem gpa mba phd ba bs ma ms ap sat act dei us usa america american nation national state
home about news events overview mission vision values president provost dean
first second third fourth one-year first-year class no yes`.split(/\s+/).filter(Boolean));

const LEADING_DROP = new Set(`the our at in on of for and to a an as by from with into through this these that those
it its we you your i here there welcome join apply visit learn discover explore find start every each when whether
while if why how what where who all some many most`.split(/\s+/));

const SOURCES = /\b(?:U\.S\. News|US News|Princeton Review|Forbes|Fiske|Niche|Carnegie|NSF|NIH|National Science Foundation|National Institutes of Health|Fulbright|Rhodes|Marshall|Truman|Goldwater|Pulitzer|Nobel|MacArthur|Guggenheim|Department of Education|IPEDS|College Scorecard|NCAA|Wall Street Journal|Times Higher Education|according to|survey(?:ed)?|reported|ranked No\.?|ranked #)/g;

const SPELLED = /\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|dozen|half)\b/gi;

const NUMBER = /\$?\b\d+(?:,\d{3})*(?:\.\d+)?(?:\s?(?:%|percent(?:age points)?|million|billion)\b|%)?/g;

// Concrete, physical things. Brochure copy almost never mentions them, so they count a little.
const CONCRETE = new Set(`table tables boat boats boiler boilers barn barns farm telescope microscope greenhouse river bay lake
reef dock docks garage studio kiln loom piano organ bell bells tunnel tunnels canoe canoes kayak horse horses cow cows
hive hives crab crabs oak maple fossil fossils cadaver cadavers robot robots drone drones rocket rockets satellite
archive manuscript manuscripts map maps furnace forge orchard vineyard trawler glacier cave observatory reactor
cemetery chapel bus train trains tractor sheep chickens bees beehive bonfire pierogi bagpipe bagpipes kitchen oven
whiteboard chalkboard notebook notebooks clipboard wetsuit waders shovel shovels`.split(/\s+/).filter(Boolean));

const CAP_RUN = /[\p{Lu}][\p{L}\p{N}'’.&-]*(?:\s+(?:of|the|for|de|du|da|del|la|le|von|van)\s+[\p{Lu}][\p{L}\p{N}'’.&-]*|\s+[\p{Lu}][\p{L}\p{N}'’.&-]*)*/gu;

function cleanWord(w) {
  const t = w.replace(/(?:['’]s?)$/u, '').replace(/,+$/, '');
  return /^(?:Dr|Mr|Mrs|Ms|St|Mt|Jr|Sr|Ft)\.$/.test(t) ? t : t.replace(/\.+$/, '');
}

// Returns { tokens: string[], weight: number, strong: number, concrete: number }
// strong = evidence-grade specifics (numbers, names, dates, sources).
export function findSpecifics(text, nameRe) {
  // Remove the school's own name first. Your name is not a specific: that is the whole logo-swap point.
  let t = nameRe ? text.replace(nameRe, (m) => ' '.repeat(m.length)) : text;
  const tokens = [];
  let strong = 0;
  let soft = 0;

  // Sources and rankings
  for (const m of t.matchAll(SOURCES)) { tokens.push(m[0]); strong += 1; }
  t = t.replace(SOURCES, (m) => ' '.repeat(m.length)); // so "U.S. News" is not also read as a name

  // Numbers
  for (const m of t.matchAll(NUMBER)) {
    const tok = m[0].trim();
    if (!tok) continue;
    tokens.push(tok); strong += 1;
  }

  // Spelled numbers: half credit, not on their own proof.
  for (const m of t.matchAll(SPELLED)) {
    // "one of the", "half the fun" are not facts
    tokens.push(m[0]); soft += 0.5;
  }

  // Proper noun runs. Skipped for Title Case headlines, where every word is capitalized and none of it means anything.
  const ws = t.match(/[\p{L}][\p{L}'\u2019-]*/gu) || [];
  const capShare = ws.length ? ws.filter((w) => /^\p{Lu}/u.test(w)).length / ws.length : 0;
  const terminal = /[.!?]["'\u201d\u2019)\]]*\s*$/.test(text);
  const headline = ws.length >= 2 && (capShare >= 0.75 || (!terminal && capShare >= 0.6));
  const firstWordAt = (t.match(/^[\s"'“(]*/) || [''])[0].length;
  for (const m of headline ? [] : t.matchAll(CAP_RUN)) {
    let wordsIn = m[0].split(/\s+/);
    const atStart = m.index === firstWordAt;
    // drop leading function words / sentence starters
    let dropped = 0;
    while (wordsIn.length && LEADING_DROP.has(cleanWord(wordsIn[0]).toLowerCase())) { wordsIn.shift(); dropped++; }
    // trailing connector words
    while (wordsIn.length && /^(?:of|the|and|for|&)$/i.test(wordsIn[wordsIn.length - 1])) wordsIn.pop();
    if (!wordsIn.length) continue;
    // A lone capitalized word at the very start of a sentence is just grammar.
    if (atStart && dropped === 0 && wordsIn.length === 1) continue;
    const meaningful = wordsIn.filter((w) => {
      const c = cleanWord(w).toLowerCase();
      return c && !GENERIC_CAPS.has(c) && !/^[\d.]+$/.test(c);
    });
    if (!meaningful.length) continue;
    const phrase = wordsIn.map(cleanWord).join(' ').trim();
    if (!phrase) continue;
    if (wordsIn.length === 1 && DATE_RE.test(cleanWord(wordsIn[0]))) {
      tokens.push(phrase); strong += 0.75;
    } else {
      tokens.push(phrase); strong += 1;
    }
  }

  // Concrete nouns: a little credit, never proof on their own.
  let concrete = 0;
  for (const w of t.toLowerCase().match(/[a-z]+/g) || []) if (CONCRETE.has(w)) concrete += 1;
  soft += Math.min(1, concrete * 0.35);

  return { tokens: dedupe(tokens), weight: strong + soft, strong, concrete };
}

function dedupe(arr) {
  const seen = new Set();
  const out = [];
  for (const a of arr) { const k = a.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(a); } }
  return out;
}

// ---------- Promises ----------

const PROMISE_PATTERNS = [
  /\bwe (?:prepare|offer|provide|help|empower|equip|ensure|deliver|give|guarantee|promise|believe|strive|inspire|challenge|cultivate|foster|support|nurture|develop|transform|invite|welcome)\b/i,
  /\bwe(?:'re| are) (?:committed|dedicated|devoted|proud|here to|passionate)\b/i,
  /\byou(?:'ll| will| can| could)\b/i,
  /\b(?:our|the) [\w-]+(?: [\w-]+)? (?:is|are) (?:dedicated|committed|devoted|passionate|here to|ready to|known for)\b/i,
  /\b(?:best|finest|top|leading|premier|renowned|unparalleled|unmatched|exceptional|outstanding|unique|only|greatest|most \w+)\b/i,
  /\bprepar(?:e|es|ing) (?:you|students|graduates)\b/i,
  /\b(?:students|graduates) (?:will|become|gain|leave|graduate)\b/i,
  /\bwhere (?:students|you|leaders|dreams)\b/i,
];

export function isPromise(text, clicheCount) {
  if (clicheCount > 0) return true;
  return PROMISE_PATTERNS.some((p) => p.test(text));
}
