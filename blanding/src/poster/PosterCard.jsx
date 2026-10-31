// STUB. Poster lane replaces this. Signature is frozen: <PosterCard report={Report} schoolName={string} />
export default function PosterCard({ report, schoolName }) {
  return <div className="border border-ink p-6 font-display text-3xl">{report?.diagnosis?.title} ({report?.score})</div>;
}
