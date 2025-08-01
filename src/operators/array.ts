import { produce } from "immer";
import type { ArrayConcat, FindFormIndex, Last } from "../types/array";
import type {
  AnyLike,
  ArrayListLike,
  ArrayOrOnlyLike,
  RecordLike,
} from "../types/like";
import type { MapFromEntriesTuple, MapFromTuple } from "../types/map";
import type { Mutable, ObjectEntries } from "../types/object";
import type { DeepWritable, Prettify, ReadonlyUnion } from "../types/shared";

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
export function getByIndex<
  const T extends ArrayListLike,
  const I extends number,
>(arr: T, index: I): FindFormIndex<DeepWritable<T>, I> {
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
  return getByIndex(arr, arr.length - 1) as Last<DeepWritable<T>>;
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

/**
 * @description 数组基于某个字段去操作
 * @param {any[] }list
 * @param {string }key
 * @returns
 */
export const getListOperator = <
  const T extends AnyLike[] | Readonly<AnyLike[]>,
  TPrimateKey extends keyof T[number],
>(
  list: T,
  primateKey: TPrimateKey,
) => {
  const createAction = <TList extends AnyLike[]>(data: TList) => {
    type TPrimateValueUnion = TList[number][TPrimateKey];
    type NumberUnion<
      T extends number,
      Tuple extends number[] = [],
    > = Tuple["length"] extends T
      ? Tuple[number]
      : NumberUnion<T, [...Tuple, Tuple["length"]]>;

    type FindByPrimateValue<
      TList extends AnyLike[],
      TPrimateValue extends TPrimateValueUnion,
    > = TList extends [infer First, ...infer Rest]
      ? First extends { [K in TPrimateKey]: TPrimateValue }
        ? First
        : FindByPrimateValue<Rest, TPrimateValue>
      : never;
    type PartialKeyBoolean = Partial<{ [K in TPrimateValueUnion]: boolean }>;

    type OnlyKeys<T> = {
      [K in keyof T]: K extends TPrimateValueUnion ? boolean : never;
    };

    return {
      /**
       * @description 需要排除掉的数据
       * @param {Record<string, boolean>} mask
       * 为 true 排除掉
       */
      omit: <TMask extends PartialKeyBoolean>(
        mask: TMask & OnlyKeys<TMask>,
      ) => {
        type OmitValueType = Prettify<{
          [K in keyof TMask as TMask[K] extends false ? never : K]: TMask[K];
        }>;
        type OmitTuple<T extends AnyLike[], U> = T extends [
          infer First extends TList[number],
          ...infer Rest,
        ]
          ? `${First[TPrimateKey]}` extends U
            ? OmitTuple<Rest, U>
            : [First, ...OmitTuple<Rest, U>]
          : [];
        const omittedData = data.filter(
          (item) => !mask[item[primateKey] as TPrimateValueUnion],
        ) as OmitTuple<TList, keyof OmitValueType>;
        return createAction(omittedData);
      },
      /**
       * @description 提取需要的数据
       * @param {Record<string, boolean>} mask
       * 为 true 需要的数据
       */
      pick: <TMask extends PartialKeyBoolean>(
        mask: TMask & OnlyKeys<TMask>,
      ) => {
        type PickValueType = {
          [K in keyof TMask as TMask[K] extends false ? never : K]: TMask[K];
        };
        type PickTuple<T extends AnyLike[], U> = T extends [
          infer First extends TList[number],
          ...infer Rest,
        ]
          ? `${First[TPrimateKey]}` extends U
            ? [First, ...PickTuple<Rest, U>]
            : [...PickTuple<Rest, U>]
          : [];
        const pickedData = data.filter(
          (item) => mask[item[primateKey] as TPrimateValueUnion],
        ) as PickTuple<TList, keyof PickValueType>;
        return createAction(pickedData);
      },
      /**
       * @description 合并
       * @param {TList[number]} addData 要合并的数据
       */
      merge: <
        const TData extends Prettify<
          Partial<{
            [K in keyof TList[number]]: AnyLike;
          }> & { [K in TPrimateKey]: AnyLike }
        >,
      >(
        addData: TData,
      ) => {
        return createAction([...data, addData] as [...TList, TData]);
      },
      unShift: <
        const TData extends {
          [K in keyof TList[number]]: AnyLike;
        },
      >(
        addData: TData,
      ) => {
        return createAction([addData, ...data] as [TData, ...TList]);
      },
      /**
       * @description 排序
       * @param {TPrimateValueUnion[]} sorts  key 对应值的数组
       */
      sort: <const TSorts extends TPrimateValueUnion[]>(sorts: TSorts) => {
        type SortTuple<
          T extends AnyLike[],
          U extends TPrimateValueUnion[],
          TFirst extends AnyLike[number] = T extends [infer A, ...infer _B]
            ? A
            : never,
          TRest extends AnyLike[] = T extends [infer _A, ...infer B]
            ? B
            : never,
          TFirstSort = U extends [infer A, ...infer _B] ? A : never,
          TRestSort extends TPrimateValueUnion[] = U extends [
            infer _A,
            ...infer B extends TPrimateValueUnion[],
          ]
            ? B
            : never,
        > = U["length"] extends 0
          ? T
          : TFirst[TPrimateKey] extends TFirstSort
            ? [TFirst, ...SortTuple<TRest, TRestSort>]
            : [...SortTuple<[...TRest, TFirst], U>];
        const draftList = [...data];
        const sortedData = filterNonNullish(
          sorts.map((sortKey) => {
            const index = draftList.findIndex(
              (item) => item[primateKey] === sortKey,
            );
            if (index === -1) {
              return undefined;
            }
            return draftList.splice(index, 1);
          }),
        )
          .flat()
          .concat(draftList) as SortTuple<TList, TSorts>;
        return createAction(sortedData);
      },
      getData: () => data,
      getDataByPrimateValue: <TValue extends TPrimateValueUnion>(
        keyValue: TValue,
      ) => {
        type FindTypeInTuple<T, U> = T extends []
          ? never
          : T extends [infer TFirst, ...infer Tail]
            ? TFirst extends U
              ? TFirst
              : FindTypeInTuple<Tail, U>
            : never;
        return data.find(
          (item) => item[primateKey] === keyValue,
        ) as unknown as FindTypeInTuple<TList, { [K in TPrimateKey]: TValue }>;
      },
      update: <
        TPrimateValue extends TPrimateValueUnion,
        TData extends FindByPrimateValue<TList, TPrimateValue>,
      >(
        primateValue: TPrimateValue,
        value: TData | ((value: TData) => TData | void),
      ) => {
        type PickValueUpdateFromList<
          TList extends AnyLike[],
          TPrimateKey extends keyof TList[number],
          TPrimateValue extends TPrimateValueUnion,
          TUpdateData,
          TCache extends AnyLike[] = [],
        > = TList extends [infer First, ...infer Rest]
          ? First extends { [K in TPrimateKey]: TPrimateValue }
            ? [...TCache, TUpdateData, ...Rest]
            : PickValueUpdateFromList<
                Rest,
                TPrimateKey,
                TPrimateValue,
                [...TCache, First]
              >
          : [];

        const newList = data.map((item) => {
          if (item[primateKey] === primateValue) {
            return produce(item, (draft: TData) => {
              if (typeof value === "function") {
                draft =
                  (value as (value: TData) => TData)(draft as TData) ?? draft;
              } else {
                draft = value;
              }
              return draft;
            });
          }
          return item;
        }) as PickValueUpdateFromList<TList, TPrimateKey, TPrimateValue, TData>;
        return createAction(newList);
      },
      getValuesByKey: <
        TKey extends keyof TList[number],
        TValue extends TList[number][TKey],
      >(
        key: TKey,
        defaultValue?: TValue,
      ) => {
        type MapTuple<
          TData extends AnyLike[],
          TKey extends keyof TData[number],
          TFirst extends AnyLike[number] = TData extends [infer A, ...infer _B]
            ? A
            : never,
          TRest extends AnyLike[] = TData extends [infer _A, ...infer B]
            ? B
            : never,
        > = TData["length"] extends 0
          ? []
          : [TFirst[TKey], ...MapTuple<TRest, TKey>];
        return data.map((item) => item[key] ?? defaultValue) as MapTuple<
          TList,
          TKey
        >;
      },
      at: <TIndex extends number = NumberUnion<TList["length"]>>(
        count: TIndex,
      ) => {
        return data.at(count) as TList[TIndex];
      },
      getRecord: () => {
        return Object.fromEntries(
          data.map((item) => [item[primateKey], item]),
        ) as {
          [Item in TList[number] as `${Item[TPrimateKey] & string}`]: Item;
        };
      },
    };
  };
  return createAction<Mutable<T>>(list);
};
