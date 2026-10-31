// Horror-trailer diagnosis for the poster. Deterministic: band + dominant cliche pick the pair.
// Puns on film titles only. No real taglines. No em dashes.

// Themed pairs, used when the copy is dead (embalmed/haunted) and this cliche dominates.
const BY_CLICHE = {
  'vibrant-community': { title: 'Night of the Living Brochure', tagline: 'They are vibrant. They are a community. They are coming for your prospects.' },
  'leaders-of-tomorrow': { title: 'Tomorrow Never Graduates', tagline: 'They were promised the future. They got a viewbook.' },
  'prepare-future': { title: 'Back to the Brochure', tagline: 'Where we are going, we do not need specifics.' },
  'world-class': { title: 'The Texas Chainsaw Mission Statement', tagline: 'Seven committees. One sentence. No survivors.' },
  'tradition-of-excellence': { title: 'Children of the Cornerstone', tagline: 'Founded in excellence. Raised by committee.' },
  'excellence': { title: 'The Exorcism of Excellence', tagline: 'It said the word until the priest left.' },
  'commitment-to-excellence': { title: 'The Exorcism of Excellence', tagline: 'It said the word until the priest left.' },
  'state-of-the-art': { title: 'The Amityville Facilities', tagline: 'The buildings are new. The sentences are not.' },
  'cutting-edge': { title: 'Edge of the Brochure', tagline: 'Cutting. Edge. Neither word is doing anything.' },
  'beautiful-campus': { title: 'A Nightmare on Elm Quad', tagline: 'Whatever you do, do not fall asleep on the tour.' },
  'find-your-place': { title: 'The Others', tagline: 'They found their place. It was everybody else\'s place too.' },
  'more-than-a-number': { title: 'Number 23 Thousand', tagline: 'You are more than a number. The number is enrollment.' },
  'hands-on': { title: 'The Hands-On Resistance', tagline: 'Something is being touched. Nobody will say what.' },
  'transform-your-world': { title: 'The Fly-Through', tagline: 'Be afraid. Be very transformed.' },
};

// Pools by band. Index picked by a stable hash so the same copy always gets the same poster.
const POOLS = {
  embalmed: [
    { title: 'The Sixth Sentence', tagline: 'I see dead copy.' },
    { title: 'Invasion of the Synonym Snatchers', tagline: 'It sounds like everyone else because it is everyone else.' },
    { title: 'The Texas Chainsaw Mission Statement', tagline: 'Seven committees. One sentence. No survivors.' },
    { title: 'Viewbook of the Dead', tagline: 'Every page says the same thing. Louder.' },
  ],
  haunted: [
    { title: 'The Sixth Sentence', tagline: 'I see dead copy.' },
    { title: 'Night of the Living Brochure', tagline: 'They came from the viewbook. They want your prospects.' },
    { title: 'The Brochure Witch Project', tagline: 'They went looking for one specific fact. They were never seen again.' },
    { title: '28 Drafts Later', tagline: 'The committee got to it first.' },
    { title: 'The Thing That Every School Says', tagline: 'It could be anyone. It could be you.' },
    { title: 'The Hills Have Buzzwords', tagline: 'And all of them are on your homepage.' },
  ],
  twitching: [
    { title: 'Pet Sematary for Proof Points', tagline: 'Some of your facts came back. Not all of them.' },
    { title: 'Final Draft Destination', tagline: 'You were so close to saying something.' },
    { title: 'Signs of Life', tagline: 'There is a pulse in paragraph two. Follow it.' },
    { title: 'Rosemary\'s Tagline', tagline: 'Born generic. Everyone said it was beautiful.' },
  ],
  breathing: [
    { title: 'It Breathes', tagline: 'Faint pulse. Strong opinions. Keep going.' },
    { title: 'Get Out of the Brochure', tagline: 'Half of this escaped. Go back for the rest.' },
    { title: 'The Specific Ones', tagline: 'They have names. They have numbers. They are getting closer.' },
  ],
  unmistakable: [
    { title: 'It Lives.', tagline: 'Nobody else could have written this.' },
    { title: 'The Unswappable', tagline: 'Put another logo on it. It rejects the transplant.' },
    { title: 'Get Out of the Brochure', tagline: 'This copy escaped. It is not going back.' },
  ],
};

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// dominantClicheId should only be passed when one cliche actually dominates (see index.js).
export function diagnose(bandId, dominantClicheId, seed = '') {
  if ((bandId === 'embalmed' || bandId === 'haunted') && dominantClicheId && BY_CLICHE[dominantClicheId]) {
    return { ...BY_CLICHE[dominantClicheId] };
  }
  const pool = POOLS[bandId] || POOLS.haunted;
  return { ...pool[hash(`${bandId}|${dominantClicheId || ''}|${seed}`) % pool.length] };
}

export const ALL_DIAGNOSES = [...Object.values(BY_CLICHE), ...Object.values(POOLS).flat()];
