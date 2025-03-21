import type { DeepMutable, Mutable } from "../types";
import type { AnyLike } from "../types/like";
import type { NumberUnion } from "../types/number";
import type { DerivationType, Prettify } from "../types/shared";

export const createHash = (data: unknown) => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${hash.toString(32)}`;
};

/**
 * @description 数组基于某个字段去操作
 * @param {any[] }list
 * @param {string }key
 * @returns
 */
export const getListOperator = <
  const T extends AnyLike[],
  TKey extends keyof T[number],
>(
  list: T,
  key: TKey,
) => {
  const createAction = <TList extends AnyLike[]>(data: TList) => {
    type TKeyValueUnion = TList[number][TKey];

    return {
      /**
       * @description 需要排除掉的数据
       * @param {Record<string, boolean>} mask
       * 为 true 排除掉
       */
      omit: <TMask extends Partial<{ [K in TKeyValueUnion]: boolean }>>(
        mask: TMask,
      ) => {
        type OmitValueType = Prettify<{
          [K in keyof TMask as TMask[K] extends true ? K : never]: TMask[K];
        }>;
        type OmitTuple<T extends AnyLike[], U> = T extends [
          infer First extends TList[number],
          ...infer Rest,
        ]
          ? `${First[TKey]}` extends U
            ? OmitTuple<Rest, U>
            : [First, ...OmitTuple<Rest, U>]
          : [];
        const omittedData = data.filter(
          (item) => !mask[item[key] as TKeyValueUnion],
        ) as OmitTuple<TList, keyof OmitValueType>;
        return createAction(omittedData);
      },
      /**
       * @description 提取需要的数据
       * @param {Record<string, boolean>} mask
       * 为 ture 需要的数据
       */
      pick: <TMask extends Partial<{ [K in TKeyValueUnion]: boolean }>>(
        mask: TMask,
      ) => {
        type PickValueType = {
          [K in keyof TMask as TMask[K] extends true ? K : never]: TMask[K];
        };
        type PickTuple<T extends AnyLike[], U> = T extends [
          infer First extends TList[number],
          ...infer Rest,
        ]
          ? `${First[TKey]}` extends U
            ? [First, ...PickTuple<Rest, U>]
            : [...PickTuple<Rest, U>]
          : [];
        const pickedData = data.filter(
          (item) => mask[item[key] as TKeyValueUnion],
        ) as PickTuple<TList, keyof PickValueType>;
        return createAction(pickedData);
      },
      /**
       * @description 合并
       * @param {TList[number]} addData 要合并的数据
       */
      merge: <
        const TData extends {
          [K in keyof TList[number]]: DerivationType<TList[number][K]>;
        },
      >(
        addData: TData,
      ) => {
        return createAction([...data, addData] as [...TList, TData]);
      },
      /**
       * @description 排序
       * @param {TKeyValueUnion[]} sorts  key 对应值的数组
       */
      sort: <const TSorts extends TKeyValueUnion[]>(sorts: TSorts) => {
        type SortTuple<
          T extends AnyLike[],
          U extends TKeyValueUnion[],
          TFirst extends AnyLike[number] = T extends [infer A, ...infer _B]
            ? A
            : never,
          TRest extends AnyLike[] = T extends [infer _A, ...infer B]
            ? B
            : never,
          TFirstSort = U extends [infer A, ...infer _B] ? A : never,
          TRestSort extends TKeyValueUnion[] = U extends [
            infer _A,
            ...infer B extends TKeyValueUnion[],
          ]
            ? B
            : never,
        > = U["length"] extends 0
          ? T
          : TFirst[TKey] extends TFirstSort
            ? [TFirst, ...SortTuple<TRest, TRestSort>]
            : [...SortTuple<[...TRest, TFirst], U>];

        const sortedData = data.sort((a, b) => {
          const indexA = sorts.indexOf(a[key]);
          const indexB = sorts.indexOf(b[key]);
          return indexA - indexB;
        }) as SortTuple<TList, TSorts>;
        return createAction(sortedData);
      },
      getData: () => data,
      getDataByValue: <TValue extends TKeyValueUnion>(keyValue: TValue) => {
        type FindTypeInTuple<T, U> = T extends []
          ? never
          : T extends [infer TFirst, ...infer Tail]
            ? TFirst extends U
              ? TFirst
              : FindTypeInTuple<Tail, U>
            : never;
        return data.find(
          (item) => item[key] === keyValue,
        ) as unknown as FindTypeInTuple<TList, { [K in TKey]: TValue }>;
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
    };
  };
  return createAction<T>(list);
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getMutable = <T>(data: T): Mutable<T> => {
  return data as Mutable<T>;
};

export const getDeepMutable = <T>(data: T): DeepMutable<T> => {
  return data as DeepMutable<T>;
};
type Success<T> = {
  data: T;
  error: null;
};
type Failure<T> = {
  data: null;
  error: T;
};
type Result<T, E = Error> = Success<T> | Failure<E>;
export const tryCatch = async <T, E = Error>(
  promiser: Promise<T>,
): Promise<Result<T, E>> => {
  try {
    const data = await promiser;
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as E,
    };
  }
};
