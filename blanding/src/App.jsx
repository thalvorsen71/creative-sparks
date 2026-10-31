import { useRef, useState } from 'react';
import { analyze } from './engine/index.js';
import { GENERIC, SPECIFIC, MIXED } from './engine/fixtures.js';
import PosterCard from './poster/PosterCard.jsx';
import Masthead from './components/Masthead.jsx';
import Intake from './components/Intake.jsx';
import Diagnosis from './components/Diagnosis.jsx';
import Mirror from './components/Mirror.jsx';
import BuriedLede from './components/BuriedLede.jsx';
import Score from './components/Score.jsx';
import Autopsy from './components/Autopsy.jsx';
import LogoSwap from './components/LogoSwap.jsx';
import HitList from './components/HitList.jsx';
import Rivals from './components/Rivals.jsx';
import Distinction from './components/Distinction.jsx';
import Footer from './components/Footer.jsx';
import { Reveal, SectionHead } from './components/ui.jsx';

const SAMPLES = {
  generic: { name: 'Northfield University', text: GENERIC },
  mixed: { name: 'Brookline State', text: MIXED },
  specific: { name: 'Harrow College', text: SPECIFIC },
};

export default function App() {
  const [schoolName, setSchoolName] = useState('');
  const [text, setText] = useState('');
  const [rivals, setRivals] = useState([]);
  const [run, setRun] = useState(null); // { report, schoolName, id }
  const resultsRef = useRef(null);

  const doRun = (t = text, name = schoolName, rv = rivals) => {
    if (!t.trim()) return;
    const clean = rv.filter((r) => r.text.trim()).slice(0, 3).map((r, i) => ({ name: r.name.trim() || `Rival ${i + 1}`, text: r.text }));
    const report = analyze(t, { schoolName: name.trim(), rivals: clean });
    setRun({ report, schoolName: name.trim(), id: (run?.id || 0) + 1 });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 60);
  };

  const sample = (k) => {
    setSchoolName(SAMPLES[k].name);
    setText(SAMPLES[k].text);
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      doRun();
    }
  };

  return (
    <div onKeyDown={onKeyDown} className="min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <Masthead />
        <Intake schoolName={schoolName} setSchoolName={setSchoolName} text={text} setText={setText}
          rivals={rivals} setRivals={setRivals} onRun={() => doRun()} onSample={sample} />

        {run && (
          <main ref={resultsRef} key={run.id} className="mt-20 grid scroll-mt-4 gap-20" aria-label="Results">
            <Reveal><Diagnosis report={run.report} /></Reveal>
            {run.report.lead && <Reveal delay={0.04}><Mirror report={run.report} /></Reveal>}
            <Reveal delay={0.06}><BuriedLede report={run.report} /></Reveal>
            <Reveal delay={0.08}><Score report={run.report} /></Reveal>
            <Reveal delay={0.08}><Autopsy report={run.report} /></Reveal>
            <Reveal delay={0.12}><LogoSwap report={run.report} schoolName={run.schoolName} /></Reveal>
            <Reveal delay={0.16}><HitList report={run.report} /></Reveal>
            {run.report.rivals.length > 0 && <Reveal delay={0.2}><Rivals report={run.report} /></Reveal>}
            <Reveal delay={0.24}>
              <SectionHead n={run.report.rivals.length ? 7 : 6} title="The Poster">Screenshot it. Send it to your VP.</SectionHead>
              <PosterCard report={run.report} schoolName={run.schoolName} />
            </Reveal>
          </main>
        )}

        <Distinction schoolName={run?.schoolName ?? schoolName.trim()} />
        <Footer />
      </div>
    </div>
  );
}
