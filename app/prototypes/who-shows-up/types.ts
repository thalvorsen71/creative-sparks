import type { StaticImageData } from "next/image";

export type Side = {
  /** Short corner label on the photo. */
  label: string;
  image: StaticImageData;
  alt: string;
  /** Direction for the photographer. */
  shot: { who: string; where: string; moment: string; avoid: string };
};
