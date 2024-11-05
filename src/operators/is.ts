import { ClassLike } from "../types/like";

export function isClass(fn: unknown): fn is ClassLike {
  return typeof fn === "function" && /^\s*class\s+/.test(fn.toString());
}

export function isFloat(value: unknown): boolean {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) !== value
  );
}

export function isInteger(value: unknown): boolean {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) === value
  );
}

export function isNumber(value: unknown): boolean {
  return typeof value === "number" && isFinite(value);
}
