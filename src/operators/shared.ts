import { RecordLike } from "../types/like";

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

//递归
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
