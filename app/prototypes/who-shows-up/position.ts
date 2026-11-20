// Pure slider maths. No React, no DOM.

export function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/** Pointer x within an element, as a 0 to 100 position. */
export function positionFromPointer(clientX: number, left: number, width: number): number {
  if (width <= 0) return 50;
  return clamp(((clientX - left) / width) * 100);
}

/** New position for a key press, or null if the key is not handled. */
export function positionFromKey(key: string, current: number, step: number): number | null {
  switch (key) {
    case "ArrowLeft":
    case "ArrowDown":
      return clamp(current - step);
    case "ArrowRight":
    case "ArrowUp":
      return clamp(current + step);
    case "Home":
      return 0;
    case "End":
      return 100;
    default:
      return null;
  }
}
