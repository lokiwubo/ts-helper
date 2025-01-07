import type { ArrayConcat, FindFormIndex, Last } from "../types/array";
import type { ArrayListLike, ArrayOrOnlyLike, RecordLike } from "../types/like";
import type { MapFromEntriesTuple, MapFromTuple } from "../types/map";
import type { ObjectEntries } from "../types/object";
import type { ReadonlyUnion, SeniorMutable } from "../types/shared";

export function filterNonNullish<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((e) => e != null) as T[];
}

export function getItem<const T extends ArrayListLike, const I extends number>(
  arr: T,
  index: I,
): FindFormIndex<SeniorMutable<T>, I> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (index < arr.length ? arr[index] : undefined) as any;
}

export function last<const T extends ArrayListLike>(
  arr: T,
): Last<SeniorMutable<T>> {
  return getItem(arr, arr.length - 1) as Last<SeniorMutable<T>>;
}

export function concat<
  const T extends ArrayOrOnlyLike,
  const U extends ArrayOrOnlyLike = [],
>(arr: T, arr2?: U): ArrayConcat<SeniorMutable<T>, SeniorMutable<U>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [arr, arr2 ?? []].flat() as any;
}

export function createMapFromArray<
  T extends ReadonlyUnion<RecordLike[]> | ReadonlyUnion<[...Array<RecordLike>]>,
  K extends keyof T[number],
>(data: T, key: K) {
  return Object.fromEntries(
    data.map((item) => [item[key as keyof typeof item], item]),
  ) as MapFromTuple<T, K>;
}

export function createMapFromEntries<
  T extends
    | ReadonlyUnion<[string, unknown][]>
    | ReadonlyUnion<[...Array<[string, unknown]>]>,
>(data: T) {
  return Object.fromEntries(data) as MapFromEntriesTuple<T>;
}

/**
 * 创建可以推导的Entries
 */
export function createEntries<T extends RecordLike>(data: T) {
  return Object.entries(data) as ObjectEntries<T>;
}
