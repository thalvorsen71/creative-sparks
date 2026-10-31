// STUB. Experience lane replaces this.
import { analyze } from './engine/index.js';
import { GENERIC } from './engine/fixtures.js';
import PosterCard from './poster/PosterCard.jsx';
export default function App() {
  const r = analyze(GENERIC, { schoolName: 'Northfield University' });
  return <main className="p-8"><h1 className="font-display text-5xl">Blanding 3.0</h1><p>{r.score}</p><PosterCard report={r} schoolName="Northfield University" /></main>;
}
