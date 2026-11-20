import { CompareSlider } from "./compare-slider";
import { rink, theater } from "./data";
import { ShotNotes } from "./shot-notes";

export default function WhoShowsUpPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <CompareSlider left={theater} right={rink} />
        <p className="text-xs text-muted-foreground">
          Concept frames made with AI to brief a shoot. Not photographs of real students.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <ShotNotes side={theater} />
        <ShotNotes side={rink} />
      </div>
    </div>
  );
}
