import { generateKeyBetween } from "fractional-indexing";

export function generatePosition(before: string | null, after: string | null): string {
  return generateKeyBetween(before, after);
}

export function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  return error.code === "P2002";
}
