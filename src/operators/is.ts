import { ClassLike, promiseLike } from "../types/like";

export function isClass(fn: unknown): fn is ClassLike {
  return typeof fn === "function" && /^\s*class\s+/.test(fn.toString());
}

export function isFloat(value: unknown): value is number {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) !== value
  );
}

export function isInteger(value: unknown): value is number {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) === value
  );
}

export function isNumber(value: unknown): boolean {
  return typeof value === "number" && isFinite(value);
}

export function isPromise(handle: unknown): handle is promiseLike {
  return (
    handle != null && typeof (handle as Promise<unknown>).then === "function"
  );
}
