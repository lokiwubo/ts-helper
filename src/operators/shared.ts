import type { RecordLike } from "../types/like";

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export function assertNonNullish<T>(value: T): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error("Assert failed: value is nullish.");
  }
}

export function asNonNullish<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new Error("Assert failed: value is nullish.");
  }
  return value;
}

/**
 * 递归遍历数据
 * @param {any} data
 * @param { Function } callback
 * @example const data = { a: 1, b: { c: 2, d: [3, 4, { e: 5 }] } };
 * recursion(data, (item) => {
 *   if (typeof item === "number") {
 *     return item * 2;
 *   }
 * });
 */
export function recursion<T>(data: T, callback: (data: T) => T | undefined) {
  const nextData = callback && callback(data);
  if (nextData !== undefined) {
    recursion(nextData, callback);
  }
}

//遍历
export function traversal<T extends RecordLike>(
  data: T[],
  callback: (
    item: T,
    params: {
      index: number;
      level: number;
      parentData?: T;
      prevItem?: T;
      nextItem?: T;
    },
  ) => void,
  getChildren: (data: T) => T[],
  parentData?: T,
  level?: number,
) {
  const internalLevel = level ?? 0;
  data.forEach((item, index) => {
    const preIndex = index - 1;
    const nextIndex = index + 1;
    callback(item, {
      index,
      level: internalLevel,
      parentData,
      prevItem: preIndex >= 0 ? data[preIndex] : undefined,
      nextItem: nextIndex < data.length ? data[nextIndex] : undefined,
    });
    traversal(
      getChildren(item),
      callback,
      getChildren,
      item,
      internalLevel + 1,
    );
  });
}

export function shallow<T>(objA: T, objB: T) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;

    for (const [key, value] of objA) {
      if (!Object.is(value, objB.get(key))) {
        return false;
      }
    }
    return true;
  }

  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;

    for (const value of objA) {
      if (!objB.has(value)) {
        return false;
      }
    }
    return true;
  }

  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof T])
    ) {
      return false;
    }
  }
  return true;
}

export function shallowCompareValues(value1: unknown, value2: unknown) {
  const type1 = typeof value1;
  const type2 = typeof value2;
  if (type1 !== type2) {
    return false;
  }
  switch (type1) {
    case "object":
      return shallow(value1, value2);
    case "string":
    case "number":
    case "boolean":
      // 对于基本类型，直接比较值
      return value1 === value2;

    default:
      return value1 === value2;
  }
}
