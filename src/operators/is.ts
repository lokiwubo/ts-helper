import type {
  ClassLike,
  FunctionLike,
  PromiseFunctionLike,
  PromiseLike,
} from "../types/like";

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

export function isPromise(handle: unknown): handle is PromiseLike {
  return (
    handle != null && typeof (handle as Promise<unknown>).then === "function"
  );
}

export const isAsyncFunction = (
  fn: FunctionLike,
): fn is PromiseFunctionLike => {
  return (
    typeof fn === "function" &&
    Object.prototype.toString.call(fn) === "[object AsyncFunction]"
  );
};

export function isProxy(obj: unknown): obj is ProxyConstructor {
  return Boolean(obj && Object.getPrototypeOf(obj) === Proxy.prototype);
}

export function isValidateNumber(value: unknown): value is number {
  // 检查值是否为NaN
  if (typeof value !== "number") {
    return false;
  }
  if (Number.isNaN(value)) {
    return false;
  }
  // 检查值是否为有限数字
  if (!Number.isFinite(value)) {
    return false;
  }
  return true;
}

export function isValidateFunction(value: unknown): value is FunctionLike {
  return typeof value === "function";
}
