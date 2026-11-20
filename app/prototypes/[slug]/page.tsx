import { notFound } from "next/navigation";

// Each prototype is a static folder next to this one and takes priority over
// this dynamic route. Anything that lands here does not exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export default function UnknownPrototype() {
  notFound();
}
