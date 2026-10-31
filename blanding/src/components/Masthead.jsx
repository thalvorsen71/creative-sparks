export default function Masthead() {
  return (
    <header className="pt-10 pb-8 sm:pt-16">
      <div className="flex items-start justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
        <span>Copy forensics, vol. 3</span>
        <span className="normal-case tracking-normal">by adeo</span>
      </div>
      <h1 className="mt-6 flex items-start font-display text-[4.25rem] leading-[0.85] tracking-tight sm:text-[9rem]">
        Blanding
        <span className="ml-2 mt-2 border border-blood px-1.5 py-0.5 font-mono text-xs tracking-widest text-blood sm:mt-4 sm:text-sm">3.0</span>
      </h1>
      <p className="mt-6 max-w-xl font-display text-2xl leading-snug sm:text-3xl">
        Paste your copy. Find out if it could belong to anyone.
      </p>
    </header>
  );
}
