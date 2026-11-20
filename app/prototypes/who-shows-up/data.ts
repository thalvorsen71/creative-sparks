import theaterImage from "./images/theater.jpg";
import rinkImage from "./images/rink.jpg";
import type { Side } from "./types";

/** Left of the divider. */
export const theater: Side = {
  label: "Opening night",
  image: theaterImage,
  alt: "Athletes in team jackets in the front rows of a school theater, waiting for the curtain.",
  shot: {
    who: "A team, still in warm-ups, there for one friend in the cast.",
    where: "From the stage, looking out at the house. Stage light on faces.",
    moment: "The minute before curtain. Leaning in, elbows, a homemade sign.",
    avoid: "The stage itself. The performer is not the subject.",
  },
};

/** Right of the divider. */
export const rink: Side = {
  label: "Game night",
  image: rinkImage,
  alt: "Theater and art students in the bleachers of a hockey rink, cheering with a hand-painted banner.",
  shot: {
    who: "The cast and the art room, there for one friend on the ice.",
    where: "From the ice, looking up at the stands. Rink light on faces.",
    moment: "Mid-cheer. Paint on sleeves, stage makeup not quite off, a painted banner.",
    avoid: "The game itself. The player is not the subject.",
  },
};

export const START_POSITION = 50;
export const KEY_STEP = 5;
