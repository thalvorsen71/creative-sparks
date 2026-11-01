import { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { renderPoster } from './renderPoster.js';

const W = 1080;
const H = 1350;

function slug(s) {
  return (
    String(s || 'your-school')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'your-school'
  );
}

export default function PosterCard({ report, schoolName }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const school = String(schoolName || '').trim() || 'Your School';

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      const canvas = canvasRef.current;
      if (cancelled || !canvas || !report) return;
      renderPoster(canvas.getContext('2d'), { width: W, height: H, report, schoolName });
    };
    const fonts = typeof document !== 'undefined' ? document.fonts : null;
    if (fonts && fonts.load) {
      Promise.all([
        fonts.load('64px "DM Serif Display"'),
        fonts.load('italic 40px "DM Serif Display"'),
        fonts.load('600 20px "JetBrains Mono"'),
        fonts.load('400 20px "JetBrains Mono"'),
      ])
        .catch(() => {})
        .then(() => fonts.ready)
        .catch(() => {})
        .then(draw);
    } else draw();
    return () => {
      cancelled = true;
    };
  }, [report, schoolName]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blanding-${slug(school)}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  const copy = async () => {
    const text = `${school}: ${report?.diagnosis?.title || 'Untitled'}. Distinction Score ${Math.round(report?.score || 0)}/100. Run yours: blanding 3.0`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* nothing more to try */
      }
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const btn =
    'inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blood';

  return (
    <figure className="m-0 w-full max-w-[540px]">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        role="img"
        aria-label={`Horror movie poster: ${school} in ${report?.diagnosis?.title || 'Untitled'}. Distinction Score ${Math.round(report?.score || 0)} out of 100.`}
        className="block w-full border-2 border-ink bg-paper"
        style={{ aspectRatio: '4 / 5', height: 'auto' }}
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={download} className={btn}>
          <Download size={16} aria-hidden="true" /> Download poster
        </button>
        <button type="button" onClick={copy} className={btn} aria-live="polite">
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy diagnosis'}
        </button>
      </div>
    </figure>
  );
}
