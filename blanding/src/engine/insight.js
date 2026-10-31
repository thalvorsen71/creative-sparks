// The insight layer (CONTRACT Amendment 2): themes, lead promise, proof kinds, buried lede, the one line.
// Themes are Tracey's T0 themes (config/promise_rules_v3.md). Shares and examples come only from corpus.json.
import CORPUS from '../corpus/corpus.json' with { type: 'json' };
import { detailScore, findDetails, KIND_PHRASE, TRIVIA } from './details.js';

const TRIVIAL_FIRST = (t) => TRIVIA.test(t);

// ---------- Themes ----------
// key: the T0 v3 theme id. Resolved against corpus.json at load, so the DATA lane's ids win.
const THEME_DEFS = [
  { key: 'access / affordability', label: 'access and affordability',
    re: [[/\b(?:afford\w*|tuition|financial aid|scholarships?|net price|costs?|debt|loans?|grants?|pell|first-generation|first-gen|free|value|access|accessible|open to all)\b/gi, 2], [/\$\d/g, 1]] },
  { key: 'career outcomes', label: 'career outcomes',
    re: [[/\b(?:careers?|jobs?|employ\w*|employers?|hired|salar\w*|placement|workforce|graduate school|law or medicine|med school|alumni network|professions?|PhD programs)\b/gi, 2]] },
  { key: 'hands-on / real-world', label: 'hands-on learning',
    re: [[/\b(?:internships?|co-?ops?|experiential|applied|field ?work|field station|labs?|research|projects?|practicum|clinical|boats?)\b/gi, 1]] },
  { key: 'belonging / community', label: 'belonging and community',
    re: [[/\b(?:communit(?:y|ies)|belong\w*|welcom\w*|friends?|family|clubs?|home|inclusive|diverse|together)\b/gi, 1]] },
  { key: 'better world / purpose', label: 'purpose and changing the world',
    re: [[/\b(?:purpose|impact|service|serve|meaning\w*|justice|change the world|difference|common good)\b/gi, 2]] },
  { key: 'your own path / flexibility', label: 'your own path',
    re: [[/\b(?:your own|flexib\w*|explore|options|choose|choice|design your|minors?|online|part-time|pathways?|your way|your pace)\b/gi, 1]] },
  { key: 'personal attention', label: 'personal attention',
    re: [[/\b(?:small class\w*|class sizes?|mentor\w*|advis\w*|one-on-one|know your name|attention|personal\w*|student-to-faculty|ratio|\d+ students around)\b/gi, 2]] },
  { key: 'tradition / heritage / values / faith', label: 'tradition and values',
    re: [[/\b(?:traditions?|heritage|history|historic|founded|legacy|faith|catholic|christian|jesuit|lutheran|methodist|baptist|values|honor code|since \d{4})\b/gi, 1]] },
  { key: 'prestige / rankings', label: 'prestige',
    re: [[/\b(?:ranked|rankings?|top|best|renowned|prestig\w*|elite|award-winning|nobel|fulbright|u\.s\. news)\b/gi, 2]] },
  { key: 'place', label: 'place',
    re: [[/\b(?:city|downtown|located|location|coast|mountains?|beach|region|neighborhood|setting|minutes from|miles from)\b/gi, 1]] },
  { key: 'innovation / future-ready', label: 'innovation',
    re: [[/\b(?:innovat\w*|technology|future|tomorrow|artificial intelligence|data science|emerging)\b/gi, 1]] },
  { key: 'rigor / academic excellence', label: 'rigor and academic excellence',
    re: [[/\b(?:rigou?r\w*|challeng\w*|intellectual\w*|excellence|demanding|books|exams?)\b/gi, 1]] },
  { key: 'creativity', label: 'creativity',
    re: [[/\b(?:creativ\w*|arts?|artists?|design|makers|imagin\w*|music|theat(?:er|re)|film)\b/gi, 1]] },
  { key: 'educational model', label: 'a model of teaching',
    re: [[/\b(?:curriculum|curricula|no majors|no lectures|tutors?|seminars?|block plan|great books|one course at a time|oral exam|core|pedagogy|competency-based)\b/gi, 2]] },
];

// Cliches are the loudest theme signal. Each one is a lead-promise genre.
const CLICHE_THEME = {
  'prepare-future': 'career outcomes', 'leaders-of-tomorrow': 'career outcomes', 'career-ready': 'career outcomes',
  'student-success': 'career outcomes', 'bright-future': 'career outcomes', 'gateway': 'career outcomes', 'unlock-potential': 'career outcomes',
  'world-class': 'prestige / rankings', 'world-renowned': 'prestige / rankings', 'top-ranked': 'prestige / rankings',
  'one-of-the-best': 'prestige / rankings', 'like-no-other': 'prestige / rankings', 'unparalleled': 'prestige / rankings',
  'vibrant-community': 'belonging / community', 'close-knit': 'belonging / community', 'home-away-from-home': 'belonging / community',
  'find-your-place': 'belonging / community', 'sense-of-community': 'belonging / community', 'diverse-inclusive': 'belonging / community',
  'diverse-community': 'belonging / community', 'nurturing-environment': 'belonging / community', 'part-of-something': 'belonging / community',
  'join-us': 'belonging / community', 'learning-community': 'belonging / community',
  'hands-on': 'hands-on / real-world', 'real-world': 'hands-on / real-world', 'inside-outside-classroom': 'hands-on / real-world',
  'cutting-edge': 'innovation / future-ready', 'state-of-the-art': 'innovation / future-ready', 'innovative': 'innovation / future-ready',
  'forefront': 'innovation / future-ready', 'pushing-boundaries': 'innovation / future-ready', 'changing-world': 'innovation / future-ready',
  'tradition-of-excellence': 'tradition / heritage / values / faith', 'rich-history': 'tradition / heritage / values / faith',
  'transform-your-world': 'better world / purpose', 'make-a-difference': 'better world / purpose', 'greater-good': 'better world / purpose',
  'shape-the-future': 'better world / purpose', 'global-citizens': 'better world / purpose', 'engaged-citizens': 'better world / purpose',
  'discover-your-passion': 'your own path / flexibility', 'endless-opportunities': 'your own path / flexibility',
  'explore-interests': 'your own path / flexibility', 'tailored': 'your own path / flexibility', 'wide-range': 'your own path / flexibility',
  'opportunities-to-grow': 'your own path / flexibility', 'academic-journey': 'your own path / flexibility',
  'more-than-a-number': 'personal attention', 'dedicated-faculty': 'personal attention', 'faculty-know-you': 'personal attention',
  'personalized-attention': 'personal attention', 'small-classes': 'personal attention', 'student-centered': 'personal attention',
  'rigorous-academics': 'rigor / academic excellence', 'academic-excellence': 'rigor / academic excellence',
  'commitment-to-excellence': 'rigor / academic excellence', 'critical-thinking': 'rigor / academic excellence',
  'excellence': 'rigor / academic excellence',
  'beautiful-campus': 'place', 'heart-of': 'place',
  'exceptional-value': 'access / affordability',
};

const corpusThemes = Array.isArray(CORPUS && CORPUS.themes) ? CORPUS.themes : [];
const firstWord = (s) => String(s).toLowerCase().split(/[\s/]+/)[0];

// key -> { id, label, share, examples }, resolved against the corpus (exact id, else same first word).
const THEMES = Object.fromEntries(THEME_DEFS.map((d) => {
  const c = corpusThemes.find((t) => t.id === d.key) || corpusThemes.find((t) => firstWord(t.id) === firstWord(d.key));
  return [d.key, {
    id: c ? c.id : d.key,
    label: c && c.label && c.label !== c.id ? c.label : d.label,
    share: c && typeof c.share === 'number' ? c.share : null,
    examples: c && Array.isArray(c.examples) ? c.examples.filter((e) => typeof e === 'string' && e.trim()) : [],
  }];
}));

export function themeScores(text, clicheIds) {
  const scores = {};
  for (const d of THEME_DEFS) {
    let s = 0;
    for (const [re, w] of d.re) { re.lastIndex = 0; s += (String(text).match(re) || []).length * w; }
    if (s) scores[d.key] = s;
  }
  for (const id of clicheIds) {
    const k = CLICHE_THEME[id];
    if (k) scores[k] = (scores[k] || 0) + 2;
  }
  return scores;
}

function topTheme(scores) {
  let best = null;
  for (const d of THEME_DEFS) {
    const s = scores[d.key] || 0;
    if (s >= 1 && (!best || s > best.score)) best = { key: d.key, score: s };
  }
  return best;
}

// ---------- Proof kinds (T0 evidence_kind) ----------
const THIRD_PARTY = /\b(?:U\.S\. News|Princeton Review|Forbes|Fiske|Niche|Carnegie|Fulbright|Rhodes|Marshall|Truman|Goldwater|Pulitzer|Nobel|MacArthur|Guggenheim|NSF|NIH|accredited by|ranked|named (?:one of|a|the) .{0,40} by|according to)\b/i;
const OUTCOME = /(?:\d[\d,.]*\s?(?:%|percent)|\$\d[\d,]*)[^.!?]{0,80}\b(?:graduates?|alumni|employed|placed|hired|went on|admitted|accepted|retention|graduation|salary|earn|class of)\b|\b(?:graduates?|alumni|class of \d{4})\b[^.!?]{0,80}(?:\d[\d,.]*\s?(?:%|percent)|\$\d[\d,]*|\b\d+ (?:went|go|were|are|got|earned|landed))/i;
const POLICY = /\b(?:pays? no tuition|guarantee[sd]?|policy|pledge|we cover|no-loan|meets? full (?:demonstrated )?need|free tuition|tuition-free|every student (?:receives|gets|is guaranteed)|is free for|covers? (?:full )?tuition)\b/i;
const STORY = /\b(?:Professor|Prof\.|Dr\.|Coach|Dean)\s+\p{Lu}|\b(?:last (?:summer|spring|fall|year|week)|this (?:summer|spring|fall)|when (?:she|he|they))\b/iu;

const MECHANISM_KINDS = new Set(['named program', 'requirement', 'structure', 'ritual', 'mechanism', 'place', 'policy', 'first']);

function proofKindFor(sentence, details) {
  const t = sentence.text;
  if (THIRD_PARTY.test(t)) return 'third_party_recognition';
  if (OUTCOME.test(t)) return 'reported_outcome';
  if (POLICY.test(t)) return 'published_policy';
  if (STORY.test(t)) return 'example_or_story';
  // A name or a number is not a mechanism. A Starbucks is not a mechanism.
  if (details.some((d) => MECHANISM_KINDS.has(d.kind) && d.w >= 2)) return 'operating_mechanism';
  return null;
}

// ---------- helpers ----------
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const pct = (share) => `${Math.round(share * 100)}%`;
const isHeadline = (t) => !/[.!?]["'”’)\]]*$/.test(t) && t.split(/\s+/).length <= 12;

// ---------- main ----------
// sentences: engine sentences plus _spec (findSpecifics result). Returns the Amendment 2 fields.
export function buildInsight(sentences) {
  const n = sentences.length;
  const per = sentences.map((s) => {
    const scores = themeScores(s.text, s.cliches.map((c) => c.id));
    const top = topTheme(scores);
    const details = findDetails(s.text, s._spec);
    return { top, details, detail: detailScore(details) };
  });

  // themes, in order of first appearance
  const byTheme = new Map();
  per.forEach((p, i) => {
    if (!p.top) return;
    const th = THEMES[p.top.key];
    if (!byTheme.has(th.id)) byTheme.set(th.id, { id: th.id, label: th.label, sentences: [] });
    byTheme.get(th.id).sentences.push(i);
  });
  const themes = [...byTheme.values()];

  // lead promise: first strong promise (headline/opening weighted), else best weak one
  let leadIdx = null;
  let confidence = 'none';
  const strength = (i) => (per[i].top ? per[i].top.score : 0) + (i === 0 ? 1 : i === 1 ? 0.5 : 0) + (isHeadline(sentences[i].text) ? 0.5 : 0);
  for (let i = 0; i < n; i++) {
    if (sentences[i].isPromise && per[i].top && per[i].top.score >= 2) { leadIdx = i; confidence = 'clear'; break; }
  }
  if (leadIdx === null) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (!sentences[i].isPromise || !per[i].top) continue;
      const s = strength(i);
      if (s > best) { best = s; leadIdx = i; }
    }
    if (leadIdx !== null) confidence = 'weak';
  }
  const leadTheme = leadIdx !== null ? THEMES[per[leadIdx].top.key] : null;
  let examples = [];
  if (leadTheme && leadTheme.examples.length) {
    const ex = leadTheme.examples;
    const start = hash(sentences[leadIdx].text) % ex.length;
    examples = [...ex.slice(start), ...ex.slice(0, start)].slice(0, 3);
  }
  // Why there is no lead promise, so the UI can say something true and kind about it.
  let reason = null;
  if (leadIdx === null) {
    const anyPromise = sentences.some((x) => x.isPromise);
    const proofFirst = n > 0 && (sentences.every((x) => !x.swappable) || sentences[0].isProof
      || (per[0].detail >= 2 && !TRIVIAL_FIRST(sentences[0].text)));
    reason = !anyPromise && proofFirst ? 'proof_first' : anyPromise ? 'unclassified' : 'no_promise';
  }
  const lead = {
    reason,
    themeId: leadTheme ? leadTheme.id : null,
    label: leadTheme ? leadTheme.label : null,
    sentenceIndex: leadIdx,
    quote: leadIdx !== null ? sentences[leadIdx].text : null,
    confidence,
    corpusShare: leadTheme ? leadTheme.share : null,
    examples,
  };

  // promises and their proof kinds
  const promises = [];
  sentences.forEach((s, i) => {
    if (!s.isPromise) return;
    const themeId = per[i].top ? THEMES[per[i].top.key].id : null;
    let evidenceIndex = null;
    let proofKind = 'none';
    for (const j of [i, i + 1]) {
      if (!sentences[j] || !sentences[j].isProof) continue;
      const k = proofKindFor(sentences[j], per[j].details);
      if (k) { evidenceIndex = j; proofKind = k; break; }
    }
    if (evidenceIndex === null) {
      // "Evidence" that only says the same thing again. A repeated assertion is not additional evidence.
      // Nearest other promise on the same theme, with no proof of its own.
      const order = [...Array(n).keys()].filter((j) => j !== i).sort((a, b) => Math.abs(a - i) - Math.abs(b - i) || a - b);
      const near = order.find((j) => sentences[j].isPromise && !sentences[j].isProof
        && per[j].top && per[i].top && per[j].top.key === per[i].top.key);
      if (near !== undefined) { evidenceIndex = near; proofKind = 'restated_claim'; }
    }
    promises.push({ sentenceIndex: i, themeId, proofKind, evidenceIndex });
  });

  // buried lede: most distinctive concrete detail. A real detail wrapped in a cliche gets a nudge:
  // that is the classic buried lede, and the most fixable one.
  let ledeIdx = null;
  let ledeScore = 0;
  per.forEach((p, i) => {
    if (p.detail < 2) return;
    const s = p.detail + (sentences[i].cliches.length ? 0.5 : 0) + (i === 0 ? 0.3 : 0);
    if (s > ledeScore) { ledeScore = s; ledeIdx = i; }
  });
  let buriedLede = null;
  if (ledeIdx !== null) {
    const s = sentences[ledeIdx];
    const best = per[ledeIdx].details[0];
    const position = ledeIdx === 0 ? 'lead' : ledeIdx < n / 3 ? 'early' : 'buried';
    const wrap = s.cliches[0] ? s.cliches[0].match : null;
    const before = sentences.slice(0, ledeIdx).filter((x) => x.swappable).length;
    const where = position === 'lead'
      ? 'You open with it. Keep it there.'
      : position === 'early'
        ? `It shows up in sentence ${ledeIdx + 1}. Move it to sentence 1.`
        : `It waits until sentence ${ledeIdx + 1} of ${n}${before ? `, behind ${before} ${before === 1 ? 'sentence' : 'sentences'} any school could sign` : ''}.`;
    const what = `It is ${KIND_PHRASE[best.kind]}${wrap ? `, wrapped in “${wrap}”` : ''}.`;
    buriedLede = { sentenceIndex: ledeIdx, text: s.text, detail: best.detail, kind: best.kind, position, why: `${what} ${where}` };
  }

  return { themes, lead, promises, buriedLede, line: diagnosisLine({ sentences, lead, buriedLede }) };
}

// ---------- the one line ----------
export function diagnosisLine({ sentences, lead, buriedLede }) {
  const n = sentences.length;
  if (!n) return 'Paste some copy. We will wait.';
  const survivors = sentences.filter((s) => s.swappable).length;
  const proofs = sentences.filter((s) => s.isProof).length;
  const leadClause = lead.label
    ? `You lead with ${lead.label.toLowerCase()}${lead.corpusShare != null ? `, like ${pct(lead.corpusShare)} of the schools we read` : ''}`
    : null;

  if (n === 1 && !buriedLede) {
    if (lead.label) {
      return lead.corpusShare != null
        ? `One line, and it is ${lead.label.toLowerCase()}, a lead promise at ${pct(lead.corpusShare)} of the schools we read.`
        : `One line, and it is ${lead.label.toLowerCase()}, which any school could sign.`;
    }
    return survivors ? 'One line, and any school could sign it.' : 'One line, and it is actually yours. Now write the paragraph.';
  }

  if (buriedLede) {
    const k = buriedLede.sentenceIndex + 1;
    // Names read inline ("the Competitive Pierogi Society"); clauses get quoted.
    const named = ['named program', 'place', 'first'].includes(buriedLede.kind);
    const d = named ? buriedLede.detail : `“${buriedLede.detail}”`;
    const s = sentences[buriedLede.sentenceIndex];
    const wrap = s.cliches[0] ? s.cliches[0].match : null;
    if (buriedLede.position === 'lead') {
      return `You open with ${d}, which is the move: most schools open with a promise, you opened with the proof.`;
    }
    if (!leadClause) {
      return wrap
        ? `No slogan to speak of, and your best detail, ${d}, is stuck in sentence ${k} behind “${wrap}”.`
        : lead.reason === 'unclassified'
          ? `We could not tell what your opening promise is, but your best detail, ${d}, is sitting in sentence ${k} waiting to be promoted.`
          : `No slogan and no lead promise, and your best detail, ${d}, is sitting in sentence ${k} waiting to be promoted.`;
    }
    if (wrap) return `${leadClause}, and your best detail, ${d}, is stuck in sentence ${k} behind “${wrap}”.`;
    return buriedLede.position === 'buried'
      ? `${leadClause}, and your best detail, ${d}, waits until sentence ${k} of ${n}.`
      : `${leadClause}, and your best detail, ${d}, shows up one sentence too late.`;
  }

  // Only when no sentence describes a mechanism or a policy. Otherwise this would scold good copy.
  const describesHow = sentences.some((x) => POLICY.test(x.text) || findDetails(x.text, x._spec).some((d) => d.w >= 2));
  if (proofs >= Math.ceil(n * 0.6) && survivors === 0 && !describesHow) {
    return `All receipts, no story: ${proofs === n ? 'every line' : `${proofs} of ${n} lines`} is a number or a name, and we could not find one that says how anything here works.`;
  }
  if (survivors === n) {
    return leadClause
      ? `${leadClause}, and we could not find anything after it that is only yours: every sentence would survive a logo swap.`
      : 'We could not find anything here that is only yours: every sentence would survive a logo swap.';
  }
  return leadClause
    ? `${leadClause}, and we could not find a detail only you could write: ${survivors} of ${n} sentences would survive a logo swap.`
    : `We could not find a detail only you could write: ${survivors} of ${n} sentences would survive a logo swap.`;
}
