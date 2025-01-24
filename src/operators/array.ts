import type { ArrayConcat, FindFormIndex, Last } from "../types/array";
import type {
  AnyLike,
  ArrayListLike,
  ArrayOrOnlyLike,
  RecordLike,
} from "../types/like";
import type { MapFromEntriesTuple, MapFromTuple } from "../types/map";
import type { ObjectEntries } from "../types/object";
import type { DeepWritable, ReadonlyUnion } from "../types/shared";

/**
 * @description 数组过滤非空元素
 * @param {any} arr
 * @returns 返回过滤后的非空元素数组
 */
export function filterNonNullish<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((e) => e != null) as T[];
}

/**
 * @description 获取数组下标对应的元素
 * @param {any} arr
 * @param {number} index
 */
export function getItem<const T extends ArrayListLike, const I extends number>(
  arr: T,
  index: I,
): FindFormIndex<DeepWritable<T>, I> {
  return (index < arr.length ? arr[index] : undefined) as AnyLike;
}

/**
 * @description 获取数组最后一个元素
 * @example
 * const arr = [1, 2, 3];
 * const last = last(arr);
 *  last: 3
 */
export function last<const T extends ArrayListLike>(
  arr: T,
): Last<DeepWritable<T>> {
  return getItem(arr, arr.length - 1) as Last<DeepWritable<T>>;
}

/**
 * @description 数组连接
 * @example
 * const arr1 = [1, 2, 3];
 * const arr2 = [4, 5, 6];
 * const arr3 = concat(arr1, arr2);
 *  arr3: [1, 2, 3, 4, 5, 6]
 */
export function concat<
  const T extends ArrayOrOnlyLike,
  const U extends ArrayOrOnlyLike = [],
>(arr: T, arr2?: U): ArrayConcat<DeepWritable<T>, DeepWritable<U>> {
  return [arr, arr2 ?? []].flat() as AnyLike;
}

/**
 * @description 更具某个key 创建Map对象
 * @example
 * const data = [{a: 1}, {a: 2}, {a: 3}];
 * const map = createMapFromArray(data, "a");
 *  map: {1: {a: 1}, 2: {a: 2}, 3: {a: 3}}
 */
export function createMapFromArray<
  T extends ReadonlyUnion<RecordLike[]> | ReadonlyUnion<[...Array<RecordLike>]>,
  K extends keyof T[number],
>(data: T, key: K) {
  return Object.fromEntries(
    data.map((item) => [item[key as keyof typeof item], item]),
  ) as MapFromTuple<T, K>;
}
/**
 * @description 由Entries创建对应数据Map对象
 * @example
 * const data = [["a", 1], ["b", 2], ["c", 3]];
 * const map = createMapFromEntries(data);
 *  map: {a: 1, b: 2, c: 3}
 */
export function createMapFromEntries<
  T extends
    | ReadonlyUnion<[string, unknown][]>
    | ReadonlyUnion<[...Array<[string, unknown]>]>,
>(data: T) {
  return Object.fromEntries(data) as MapFromEntriesTuple<T>;
}

/**
 * 创建可以推导的Entries
 * @example
 * const data = { a: 1, b: 2, c: 3 };
 * const entries = createEntries(data);
 *  entries: [["a", 1], ["b", 2], ["c", 3]]
 */
export function createEntries<T extends RecordLike>(data: T) {
  return Object.entries(data) as ObjectEntries<T>;
}
