// B-movie horror poster of a Blanding diagnosis. Draws on a 2D canvas.
// Design space is 1080x1350; the context is scaled to whatever size is asked for.

const C = {
  paper: '#F4EFE6',
  bone: '#E8E0D2',
  ink: '#141210',
  smoke: '#6B645B',
  blood: '#C1272D',
};
const SERIF = '"DM Serif Display", Georgia, serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = '"Inter", system-ui, sans-serif';

const DW = 1080;
const DH = 1350;

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LOW = ['embalmed', 'haunted', 'twitching'];

const RATINGS = {
  embalmed: [
    { letter: 'B', text: 'for Bland. Contains scenes of excessive synergy.' },
    { letter: 'B', text: 'for Bland. Viewer discretion advised: nothing happens.' },
    { letter: 'B', text: 'for Bland. Not suitable for anyone with a pulse.' },
  ],
  haunted: [
    { letter: 'G', text: 'for Generic. Contains strong language: "excellence."' },
    { letter: 'G', text: 'for Generic. May cause déjà vu on any other campus.' },
    { letter: 'G', text: 'for Generic. Frightening imagery: a stock photo of a lawn.' },
  ],
  twitching: [
    { letter: 'PG', text: 'for Platitudes Galore. Some specifics may disturb the board.' },
    { letter: 'PG', text: 'for Pulse, Barely. Parental guidance: add one more number.' },
    { letter: 'PG', text: 'for Promising, Gradually. Contains one real noun.' },
  ],
  breathing: [
    { letter: 'S', text: 'for Specific. Contains named people and actual numbers.' },
    { letter: 'S', text: 'for Specific. Rival schools may find this upsetting.' },
    { letter: 'S', text: 'for Specific. The logo swap did not go well for anyone else.' },
  ],
  unmistakable: [
    { letter: 'A', text: 'for Actual. Contains proof. Lots of it.' },
    { letter: 'A', text: 'for Actual. No other school could have said this.' },
    { letter: 'A', text: 'for Authentic. Marketing may not survive the screening.' },
  ],
};

const BILLING = {
  low: ['A BLANDING 3.0 PRODUCTION', 'FILMED ENTIRELY ON THE HOMEPAGE', 'BASED ON A TRUE ABOUT PAGE'],
  high: ['A BLANDING 3.0 PRODUCTION', 'FILMED ON LOCATION, WITH FACTS', 'BASED ON ACTUAL EVENTS'],
};

const FOOTER_LOW = ['No synonyms were harmed in the making of this copy.', 'Coming soon to every school website near you.', 'In a homepage near you, the same homepage.'];
const FOOTER_HIGH = ['Now playing at exactly one school.', 'Not coming to any other school website.', 'Rival schools cannot do the sequel.'];

function titleCase(s) {
  return String(s).replace(/\b([a-z])([a-z']*)/gi, (_, a, b) => a.toUpperCase() + b.toLowerCase());
}

function setFont(ctx, size, family, weight = '', style = '') {
  ctx.font = `${style} ${weight} ${Math.round(size)}px ${family}`.trim();
}
function spacing(ctx, px) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`;
}

// Largest font size (<= max) that makes the text fit within maxW on one line.
function fitSize(ctx, text, maxW, maxSize, minSize, family, weight, style, tracking = 0) {
  let size = maxSize;
  for (; size > minSize; size -= 1) {
    setFont(ctx, size, family, weight, style);
    spacing(ctx, tracking);
    if (ctx.measureText(text).width <= maxW) break;
  }
  return size;
}

function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(test).width > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Largest size where wrapped text fits in maxW x maxH with at most maxLines lines.
// A single word wider than maxW forces a smaller size, so nothing ever overflows.
function fitBlock(ctx, text, maxW, maxH, maxLines, maxSize, minSize, family, weight, style, lh, tracking = 0) {
  for (let size = maxSize; size >= minSize; size -= 2) {
    setFont(ctx, size, family, weight, style);
    spacing(ctx, tracking);
    const lines = wrap(ctx, text, maxW);
    const widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
    if (lines.length <= maxLines && widest <= maxW && lines.length * size * lh <= maxH) {
      return { size, lines };
    }
  }
  setFont(ctx, minSize, family, weight, style);
  spacing(ctx, tracking);
  let lines = wrap(ctx, text, maxW).slice(0, maxLines);
  // last resort: hard shrink to width
  const widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
  let size = minSize;
  if (widest > maxW) size = Math.max(10, Math.floor((minSize * maxW) / widest));
  setFont(ctx, size, family, weight, style);
  spacing(ctx, tracking);
  lines = wrap(ctx, text, maxW).slice(0, maxLines);
  return { size, lines };
}

function drawGrain(ctx, rand) {
  // Paper base with warm edge vignette.
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, DW, DH);
  const g = ctx.createRadialGradient(DW / 2, DH / 2, DH * 0.35, DW / 2, DH / 2, DH * 0.8);
  g.addColorStop(0, 'rgba(232,224,210,0)');
  g.addColorStop(1, 'rgba(200,184,156,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, DW, DH);
  // Blotches
  for (let i = 0; i < 26; i++) {
    const x = rand() * DW;
    const y = rand() * DH;
    const r = 60 + rand() * 180;
    const b = ctx.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, `rgba(150,120,80,${0.03 + rand() * 0.04})`);
    b.addColorStop(1, 'rgba(150,120,80,0)');
    ctx.fillStyle = b;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Grain specks
  for (let i = 0; i < 16000; i++) {
    const x = rand() * DW;
    const y = rand() * DH;
    const dark = rand() < 0.6;
    ctx.fillStyle = dark ? `rgba(20,18,16,${0.03 + rand() * 0.07})` : `rgba(255,255,255,${0.1 + rand() * 0.2})`;
    const s = rand() < 0.1 ? 2 : 1;
    ctx.fillRect(x, y, s, s);
  }
  // Fold creases
  ctx.save();
  ctx.strokeStyle = 'rgba(20,18,16,0.07)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, DH / 2);
  ctx.lineTo(DW, DH / 2 + 2);
  ctx.moveTo(DW / 2, 0);
  ctx.lineTo(DW / 2 + 2, DH);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, DH / 2 + 3);
  ctx.lineTo(DW, DH / 2 + 5);
  ctx.moveTo(DW / 2 + 3, 0);
  ctx.lineTo(DW / 2 + 5, DH);
  ctx.stroke();
  ctx.restore();
}

function drawFrame(ctx) {
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, DW - 60, DH - 60);
  ctx.lineWidth = 3;
  ctx.strokeRect(54, 54, DW - 108, DH - 108);
}

function centerText(ctx, text, x, y) {
  ctx.textAlign = 'center';
  ctx.fillText(text, x + (ctx.letterSpacing && parseFloat(ctx.letterSpacing) ? parseFloat(ctx.letterSpacing) / 2 : 0), y);
}

function drawBloodBar(ctx, rand, y, h, withDrips) {
  const x0 = 54;
  const x1 = DW - 54;
  ctx.fillStyle = C.blood;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  // ragged top edge
  for (let x = x0; x <= x1; x += 18) ctx.lineTo(x, y + (rand() - 0.5) * 5);
  for (let x = x1; x >= x0; x -= 18) ctx.lineTo(x, y + h + (rand() - 0.5) * 6);
  ctx.closePath();
  ctx.fill();
  if (!withDrips) return;
  const n = 11;
  for (let i = 0; i < n; i++) {
    const x = x0 + 40 + ((x1 - x0 - 80) * (i + rand() * 0.7)) / n;
    const w = 7 + rand() * 11;
    const len = 18 + Math.pow(rand(), 1.6) * 60;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h - 4);
    ctx.lineTo(x - w / 2, y + h + len);
    ctx.arc(x, y + h + len, w / 2, Math.PI, 0, true);
    ctx.lineTo(x + w / 2, y + h - 4);
    ctx.closePath();
    ctx.fill();
    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x - w / 2 + 1.5, y + h, 1.5, len * 0.8);
    ctx.fillStyle = C.blood;
  }
}

function drawRays(ctx, cx, cy, rand, clip) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(clip.x, clip.y, clip.w, clip.h);
  ctx.clip();
  ctx.fillStyle = 'rgba(20,18,16,0.07)';
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.05;
    const b = a + (Math.PI * 2) / n / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 1200, cy + Math.sin(a) * 1200);
    ctx.lineTo(cx + Math.cos(b) * 1200, cy + Math.sin(b) * 1200);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawStamp(ctx, rand, cx, cy, R, report, high) {
  const col = high ? C.ink : C.blood;
  const score = Math.max(0, Math.min(100, Math.round(report.score || 0)));
  const label = String(report.band?.label || '').toUpperCase();
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-9 * Math.PI) / 180);
  ctx.globalAlpha = 0.93;
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  // paper disc so the stamp reads over the drips
  ctx.fillStyle = C.paper;
  ctx.beginPath();
  ctx.arc(0, 0, R + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = col;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, R - 20, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  setFont(ctx, 17, MONO, '600');
  spacing(ctx, 4);
  ctx.fillText('DISTINCTION', 2, -R * 0.56);

  const numStr = String(score);
  const numSize = fitSize(ctx, numStr, R * 1.2, 150, 60, SERIF, '', '');
  setFont(ctx, numSize, SERIF);
  spacing(ctx, 0);
  ctx.fillText(numStr, 0, numSize * 0.3 - 22);
  setFont(ctx, 20, MONO, '600');
  spacing(ctx, 2);
  ctx.fillText('OUT OF 100', 1, R * 0.5 - 18);

  // band banner
  const bh = 46;
  setFont(ctx, 28, MONO, '600');
  spacing(ctx, 5);
  const bw = Math.min(R * 2 + 30, ctx.measureText(label).width + 40);
  const by = R * 0.5 + 10;
  ctx.fillStyle = col;
  ctx.fillRect(-bw / 2, by, bw, bh);
  ctx.fillStyle = C.paper;
  const bs = fitSize(ctx, label, bw - 24, 28, 12, MONO, '600', '', 5);
  setFont(ctx, bs, MONO, '600');
  spacing(ctx, 5);
  ctx.fillText(label, 2.5, by + bh / 2 + bs * 0.35);
  spacing(ctx, 0);

  // distress: paper specks punched out of the ink
  ctx.globalAlpha = 1;
  ctx.fillStyle = C.paper;
  for (let i = 0; i < 380; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * (R + 4);
    const s = 1 + rand() * (rand() < 0.1 ? 4 : 2);
    ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, s, s * (0.5 + rand()));
  }
  ctx.restore();
}

function leaderLine(ctx, label, value, x, y, w) {
  setFont(ctx, 20, MONO, '600');
  spacing(ctx, 0.5);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.ink;
  ctx.fillText(label, x, y);
  ctx.textAlign = 'right';
  ctx.fillText(value, x + w, y);
  const lw = ctx.measureText(label).width;
  const vw = ctx.measureText(value).width;
  // dot leaders
  ctx.fillStyle = C.smoke;
  ctx.textAlign = 'left';
  setFont(ctx, 20, MONO, '400');
  const dotW = ctx.measureText('.').width;
  const free = w - lw - vw - 16;
  const dots = Math.max(0, Math.floor(free / dotW));
  if (dots > 1) ctx.fillText('.'.repeat(dots), x + lw + 8, y);
  ctx.fillStyle = C.ink;
}

function drawRating(ctx, x, y, w, h, variant) {
  ctx.save();
  ctx.strokeStyle = C.ink;
  ctx.fillStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);
  const cw = 118;
  ctx.fillRect(x, y, cw, h);
  ctx.fillStyle = C.paper;
  ctx.textAlign = 'center';
  setFont(ctx, 16, MONO, '600');
  spacing(ctx, 3);
  ctx.fillText('RATED', x + cw / 2 + 1.5, y + 32);
  const ls = fitSize(ctx, variant.letter, cw - 24, 96, 40, SERIF, '', '');
  setFont(ctx, ls, SERIF);
  spacing(ctx, 0);
  ctx.fillText(variant.letter, x + cw / 2, y + h - 30);
  ctx.fillStyle = C.ink;
  const tx = x + cw + 14;
  const tw = w - cw - 28;
  const blk = fitBlock(ctx, variant.text, tw, h - 28, 6, 19, 12, MONO, '600', '', 1.3);
  setFont(ctx, blk.size, MONO, '600');
  spacing(ctx, 0);
  ctx.textAlign = 'left';
  const th = blk.lines.length * blk.size * 1.3;
  let ty = y + (h - th) / 2 + blk.size * 1.0;
  for (const l of blk.lines) {
    ctx.fillText(l, tx, ty);
    ty += blk.size * 1.3;
  }
  ctx.restore();
}

export function renderPoster(ctx, opts = {}) {
  const { width = 1080, height = 1350, report, schoolName } = opts;
  const r = report || {};
  const band = r.band || { id: 'embalmed', label: 'Embalmed', verdict: '' };
  const stats = r.stats || {};
  const title = String(r.diagnosis?.title || 'Untitled').trim() || 'Untitled';
  const tagline = String(r.diagnosis?.tagline || '').trim();
  const school = String(schoolName || '').trim() || 'Your School';
  const high = !LOW.includes(band.id);
  const seed = hashStr(`${title}|${r.score}|${band.id}|${school}|${stats.words}`);
  const rand = rng(seed);
  const pick = (arr) => arr[seed % arr.length];

  ctx.save();
  ctx.scale(width / DW, height / DH);
  ctx.textBaseline = 'alphabetic';
  spacing(ctx, 0);

  drawGrain(ctx, rand);

  const CX = DW / 2;
  const IW = 840; // inner text width

  // Rays for the triumph posters (behind everything else)
  if (high) drawRays(ctx, 800, 900, rand, { x: 54, y: 54, w: DW - 108, h: DH - 108 });

  drawFrame(ctx);

  // Top billing
  ctx.fillStyle = C.ink;
  setFont(ctx, 30, MONO, '600');
  spacing(ctx, 5);
  centerText(ctx, 'adeo presents', CX, 112);
  setFont(ctx, 16, MONO, '400');
  spacing(ctx, 4);
  ctx.fillStyle = C.smoke;
  centerText(ctx, pick(high ? BILLING.high : BILLING.low), CX, 142);
  ctx.fillStyle = C.ink;
  ctx.fillRect(90, 162, DW - 180, 3);

  // School line
  const schoolLine = `${school.toUpperCase()} IN`;
  const sbk = fitBlock(ctx, schoolLine, IW, 62, 2, 46, 14, MONO, '600', '', 1.2, 4);
  setFont(ctx, sbk.size, MONO, '600');
  spacing(ctx, 4);
  ctx.fillStyle = C.blood;
  {
    const lhS = sbk.size * 1.2;
    let y0 = 232 - (sbk.lines.length - 1) * lhS * 0.5 - (sbk.lines.length > 1 ? 4 : 0);
    for (const l of sbk.lines) {
      centerText(ctx, l, CX, y0);
      y0 += lhS;
    }
  }

  // Title
  const tbox = { y: 262, h: 330 };
  const tb = fitBlock(ctx, title.toUpperCase(), IW, tbox.h, 3, 210, 54, SERIF, '', '', 0.94, 0);
  setFont(ctx, tb.size, SERIF);
  spacing(ctx, 0);
  const lh = tb.size * 0.94;
  const total = lh * tb.lines.length;
  let ty = tbox.y + (tbox.h - total) / 2 + tb.size * 0.8;
  for (const line of tb.lines) {
    // offset shadow for that cheap-print look
    ctx.fillStyle = 'rgba(193,39,45,0.9)';
    ctx.textAlign = 'center';
    const so = Math.max(2, Math.round(tb.size * 0.025));
    ctx.fillText(line, CX + so, ty + so);
    ctx.fillStyle = C.ink;
    ctx.fillText(line, CX, ty);
    ty += lh;
  }

  // Tagline
  const tg = tagline ? `“${tagline}”` : '';
  if (tg) {
    const tgs = fitSize(ctx, tg, IW, 50, 20, SERIF, '', 'italic');
    setFont(ctx, tgs, SERIF, '', 'italic');
    spacing(ctx, 0);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'center';
    ctx.fillText(tg, CX, 636);
  }

  // Blood bar (or triumph banner)
  const barY = 668;
  if (high) {
    drawBloodBar(ctx, rand, barY, 58, false);
    ctx.fillStyle = C.paper;
    setFont(ctx, 40, MONO, '600');
    spacing(ctx, 10);
    centerText(ctx, 'IT LIVES.', CX, barY + 43);
  } else {
    drawBloodBar(ctx, rand, barY, 22, true);
  }

  // Starring block
  const sx = 96;
  const sw = 520;
  ctx.textAlign = 'left';
  ctx.fillStyle = C.smoke;
  setFont(ctx, 17, MONO, '600');
  spacing(ctx, 6);
  ctx.fillText('STARRING', sx, 800);
  const top = (r.cliches || []).slice(0, 3).map((c) => `“${titleCase(c.phrase)}”`);
  let cast;
  if (top.length === 0) cast = high ? 'Actual Proper Nouns' : 'Absolutely Nothing';
  else if (top.length === 1) cast = top[0];
  else if (top.length === 2) cast = `${top[0]} and ${top[1]}`;
  else cast = `${top[0]}, ${top[1]} and ${top[2]}`;
  const sb = fitBlock(ctx, cast, sw, 100, 3, 38, 20, SERIF, '', 'italic', 1.1);
  setFont(ctx, sb.size, SERIF, '', 'italic');
  spacing(ctx, 0);
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'left';
  let sy = 806 + sb.size * 0.9;
  for (const l of sb.lines) {
    ctx.fillText(l, sx, sy);
    sy += sb.size * 1.1;
  }
  sy -= sb.size * 1.1;
  ctx.fillStyle = C.smoke;
  setFont(ctx, 17, MONO, '600');
  spacing(ctx, 6);
  ctx.fillText(high ? 'AS THEMSELVES, FOR ONCE' : 'AS ITSELF', sx, sy + 38);
  // verdict
  if (band.verdict) {
    const vb = fitBlock(ctx, band.verdict, sw, 60, 2, 16, 12, MONO, '400', '', 1.4);
    setFont(ctx, vb.size, MONO, '400');
    spacing(ctx, 0);
    ctx.fillStyle = C.smoke;
    let vy = sy + 76;
    if (vy + vb.lines.length * vb.size * 1.4 > 1030) vy = 1030 - vb.lines.length * vb.size * 1.4;
    for (const l of vb.lines) {
      ctx.fillText(l, sx, vy);
      vy += vb.size * 1.4;
    }
  }

  // Stamp
  drawStamp(ctx, rand, 836, 880, 150, r, high);

  // Divider
  ctx.fillStyle = C.ink;
  ctx.fillRect(90, 1040, DW - 180, 3);

  // Rating box
  const rv = pick(RATINGS[band.id] || RATINGS.embalmed);
  drawRating(ctx, 90, 1068, 350, 170, rv);

  // Credits
  const cx0 = 480;
  const cw = DW - 90 - cx0;
  const words = stats.words || 0;
  const total_ = r.logoSwap?.total || 0;
  const surv = (r.logoSwap?.survivors || []).length;
  const dens = (stats.clicheDensity ?? 0).toFixed(1);
  const orphans = (r.promiseProof?.orphans || []).length;
  ctx.fillStyle = C.smoke;
  setFont(ctx, 14, MONO, '600');
  spacing(ctx, 5);
  ctx.textAlign = 'left';
  ctx.fillText('BILLING BLOCK', cx0, 1082);
  const rows = [
    ['WORDS EXAMINED', String(words)],
    ['CLICHES PER 100 WORDS', dens],
    ['SURVIVE THE LOGO SWAP', total_ ? `${surv} OF ${total_}` : 'N/A'],
    ['ORPHANED PROMISES', String(orphans)],
    ['DISTINCTION SCORE', `${Math.round(r.score || 0)}/100`],
  ];
  let ry = 1116;
  for (const [a, b] of rows) {
    leaderLine(ctx, a, b, cx0, ry, cw);
    ry += 30;
  }

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = C.smoke;
  setFont(ctx, 15, MONO, '400');
  spacing(ctx, 1);
  const foot = pick(high ? FOOTER_HIGH : FOOTER_LOW);
  const fs = fitSize(ctx, foot, IW, 15, 10, MONO, '400', '', 1);
  setFont(ctx, fs, MONO, '400');
  spacing(ctx, 1);
  ctx.fillText(foot, CX + 0.5, 1280);

  spacing(ctx, 0);
  ctx.restore();
}

export default renderPoster;
