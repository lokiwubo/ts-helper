import type { AnyLike, ArrayListLike, StringFieldLike } from "./like";
import type { Add, Sub } from "./number";
import type { AllKeys } from "./object";
import type { ReadonlyUnion, ReturnPromiseType } from "./shared";
/**
 * @description 用来转为数组
 * @example
 * ```typescript
 * type setArray = SetArray<number>;
 * number[]
 * ```
 */
export type SetArray<T> = T extends ArrayListLike ? [...T] : [T];

/**
 * @description 合并两个数组
 * @example
 * ```typescript
 * type concat = Concat<[1, 2, 3], [4, 5, 6]>;
 * [1, 2, 3, 4, 5, 6]
 */
export type ArrayConcat<T, A> = [...SetArray<T>, ...SetArray<A>];

/**
 * @description 往数组结尾处添加元素
 * @example
 * ```typescript
 * type push = Push<[1, 2, 3, 4, 5, 6], 7>;
 * [1, 2, 3, 4, 5, 6, 7]
 */
export type Push<Tuple extends unknown[], R> = Tuple extends [...infer T]
  ? [...T, R]
  : never;

/**
 * @description 往数组开头中添加元素
 * @example
 * ```typescript
 * type prepend = Prepend<[1, 2, 3, 4, 5, 6], 0>;
 * [0, 1, 2, 3, 4, 5, 6]
 */
export type Prepend<Tuple extends ArrayListLike, E> = [E, ...Tuple];

/**
 * @description shift数组第一个元素
 * @example
 * ```typescript
 * type shift = Shift<[1, 2, 3, 4, 5, 6]>
 * [2, 3, 4, 5, 6]
 */
export type Shift<T extends ArrayListLike> = T extends [unknown, ...infer A]
  ? A
  : [];

/**
 * @description 删除数组末尾元素
 * @example
 * ```typescript
 * type pop = Pop<[1, 2, 3, 4, 5, 6]>
 * [1, 2, 3, 4, 5]
 */
export type Pop<T extends ArrayListLike> = T extends [...infer A, unknown]
  ? A
  : [];

type SeniorShiftHelper<
  T extends ArrayListLike,
  N extends number,
  C extends number = 0,
> = C extends N ? T : SeniorShiftHelper<Shift<T>, N, Add<C, 1>>;

/**
 * @description 从数组中第n位获取数组
 * @example
 * ```typescript
 * type seniorShift = SeniorShift<[1,2,3,4,5,6],2>
 * [3, 4, 5, 6]
 */
export type SeniorShift<
  T extends ArrayListLike,
  N extends number,
> = SeniorShiftHelper<T, N>;

type SeniorPopHelper<
  T extends ArrayListLike,
  N extends number,
  C extends number = 0,
> = C extends N ? T : SeniorPopHelper<Pop<T>, N, Add<C, 1>>;

/**
 * @description 获取从数组中第一个到倒数第n位的数组
 * @example
 * ```typescript
 * type seniorPop = SeniorPop<[1,2,3,4,5,6],2>
 * [1, 2, 3, 4]
 */
export type SeniorPop<
  T extends ArrayListLike,
  N extends number,
> = SeniorPopHelper<T, N>;
// type seniorShift = SeniorPop<[1,2,3,4,5,6],2>
// [3, 4, 5, 6]

type SliceHelper<
  A extends ArrayListLike,
  S extends number,
  E extends number = Length<A>,
> = S extends E ? [] : SeniorShift<SeniorPop<A, Sub<Length<A>, E>>, S>;

/**
 * @description 获取数组中从第s位到第e位的数组
 * @example
 * ```typescript
 * type slice = Slice<[1, 2, 3, 4, 5, 6], 2, 4>;
 * [3, 4]
 */
export type Slice<
  T extends ArrayListLike,
  S extends number,
  E extends number = Length<T>,
> = SliceHelper<T, S, E>;

/**
 * @description 添加元素到数组结尾
 * @example
 * ```typescript
 * type unShift = UnShift<[1, 2, 3, 4], 0>;
 * [1, 2, 3, 4, 0]
 */
export type UnShift<T extends ArrayListLike, A> = [...T, A];

/**
 * @description 数组转联合类型
 * @example
 * ```typescript
 * type unionFromArray = UnionFromArray<[1, 2, 3, 4]>;
 * 1 | 2 | 3 | 4
 */
export type UnionFromArray<T> = T extends (infer U)[] ? U : never;

type JoinHelper<
  A extends StringFieldLike[],
  U extends string = "",
  C extends string = "",
> =
  Length<A> extends 0
    ? C
    : JoinHelper<
        Slice<A, 1>,
        U,
        C extends "" ? `${First<A>}` : `${C}${U}${First<A>}`
      >;
/**
 * @description 数组转字符串
 * @example
 * ```typescript
 * type join = Join<[1, 2, 3, 4], "-">;
 * "1-2-3-4"
 */
export type Join<
  T extends StringFieldLike[],
  U extends string = "",
> = JoinHelper<T, U>;

type ReturnPromiseArrayHelper<
  T extends (() => Promise<unknown>)[],
  R extends ArrayListLike = [],
> = T extends [infer U, ...infer O]
  ? O extends (() => Promise<unknown>)[]
    ? ReturnPromiseArrayHelper<O, [...R, ReturnPromiseType<U>]>
    : R
  : R;
/**
 * @description 抽取数组中Promise的返回值
 * @example
 * ```typescript
 * type returnPromiseArray = ReturnPromiseArray<[()=>Promise<string>, ()=>Promise<1>,()=>Promise<2>,()=>Promise<null>]>
 * [string, 1, 2, null]
 */
export type ReturnPromiseArray<T extends (() => Promise<unknown>)[]> =
  ReturnPromiseArrayHelper<T>;

/**
 * @description 获取数组中自定下标的元素
 * @example
 * ```typescript
 * type elementType = ElementType<[1, 2, 3, 4, 5], 2>;
 * 2
 */
export type FindFormIndex<
  T extends ArrayListLike,
  I extends number,
> = T extends [infer U, ...infer O]
  ? I extends 0
    ? U
    : FindFormIndex<O, Sub<I, 1>>
  : undefined;

type FirstHelper<
  Tuple extends ArrayListLike,
  U = FindFormIndex<Tuple, 0>,
> = U extends undefined ? Tuple[number] : U;

/**
 * @description 获取数组第一个元素
 * @example
 * ```typescript
 * type first = First<[1, 2, 3, 4, 5]>;
 * 1
 */
export type First<Tuple extends ArrayListLike> = FirstHelper<Tuple>;
// type first = First<[1, 2, 3, 4, 5]>;
//1

type LastHelper<
  Tuple extends ArrayListLike,
  U = FindFormIndex<Tuple, Sub<Tuple["length"], 1>>,
> = U extends undefined ? Tuple[number] : U;

/**
 * @description 获取数组最后一个元素
 * @example
 * ```typescript
 * type last = Last<[1, 2, 3, 4, 5]>;
 * 5
 */
export type Last<Tuple extends ArrayListLike> = LastHelper<Tuple>;

/**
 * @description 获取数组元素个数
 * @example
 * ```typescript
 * type length = Length<[1, 2, 3, 4, 5]>;
 * 5
 */
export type Length<Tuple extends ArrayListLike> = Tuple["length"];

/**
 * @description 判断数组中是否包含某个元素
 * @example
 * ```typescript
 * type includes = Includes<[1, 2, 3, 4, 5], 4>;
 * true
 */
export type Includes<Tuple extends ArrayListLike, O> = O extends Tuple[number]
  ? true
  : false;

type IndexOfHelper<
  Tuple extends ArrayListLike,
  V,
  S extends number = 0,
> = Tuple extends [infer F, ...infer Rest]
  ? F extends V
    ? S
    : IndexOfHelper<Rest, V, Add<S, 1>>
  : -1;
/**
 * @description 数组中元素的索引
 * @example
 * ```typescript
 * type indexOf = IndexOf<[1, 2, 3, 4, 5], 4>;
 * 3
 */
export type IndexOf<Tuple extends ArrayListLike, V> = IndexOfHelper<Tuple, V>;

type ReverseHelper<
  Tuple extends ArrayListLike,
  Cache extends ArrayListLike = [],
> = Tuple["length"] extends 0
  ? Cache
  : Tuple extends [...infer Rest, infer F]
    ? ReverseHelper<Rest, Push<Cache, F>>
    : Cache;
/**
 * @description 数组反转
 * @example
 * ```typescript
 * type reverse = Reverse<[1, 2, 3, 4, 5]>;
 * [5, 4, 3, 2, 1]
 */
export type Reverse<Tuple extends ArrayListLike> = ReverseHelper<Tuple>;

type FillArrayHelper<
  T extends number,
  U extends ArrayListLike = [],
  V = unknown,
> = Length<U> extends T ? U : FillArrayHelper<T, Push<U, V>, V>;

/**
 * @description 填充数组
 * @example
 * ```typescript
 * type fillArray = FillArray<5, "a">;
 * ["a", "a", "a"]
 * ```
 */
export type FillArray<T extends number, V = unknown> = FillArrayHelper<
  T,
  [],
  V
>;

/**
 * @description 通过key 过滤含有该key的对象出的数组
 * @example
 * ```typescript
 * type filterByKey = FilterByKey<[{a:1,b:2}, {a:3,c:4}, {c:5,b:6}], "a">;
 * [{a:1,b:2}, {a:3,c:4}]
 * ```
 */
export type FilterByKey<
  T extends AnyLike[],
  U extends AllKeys<T[number]>,
> = T extends [infer First, ...infer Rest]
  ? First extends Record<U, AnyLike>
    ? [First, ...FilterByKey<Rest, U>]
    : [...FilterByKey<Rest, U>]
  : T extends [infer First]
    ? First extends Record<U, AnyLike>
      ? [First]
      : []
    : [];

/**
 * @description Exclude 从数组中排除某些元素
 * @example
 * ```typescript
 * type ExcludeFromTuple = ExcludeFromArray<[1, 2, 3, 4, 5], 1>;
 * [2, 3, 4, 5]
 * ```
 */
export type ExcludeFromTuple<T extends AnyLike[], E> = T extends [
  infer First,
  ...infer Rest,
]
  ? First extends E
    ? ExcludeFromTuple<Rest, E> // 如果当前元素是 E 类型，则跳过
    : [First, ...ExcludeFromTuple<Rest, E>] // 否则保留当前元素
  : [];

/**
 * @description 元组去重
 * @example
 * ```typescript
 * type uniqueTuple = UniqueTuple<[1, 2, 3, 2, 1]>;
 * [1, 2, 3]
 * ```
 */
export type UniqueTuple<
  T extends AnyLike[],
  Result extends AnyLike[] = [],
> = T extends [infer First, ...infer Rest]
  ? First extends Rest[number]
    ? UniqueTuple<Rest, Result>
    : UniqueTuple<Rest, [...Result, First]>
  : Result;

export type FindTypeInTuple<T, U> = T extends []
  ? never
  : T extends [infer Head, ...infer Tail]
    ? Head extends U
      ? U
      : FindTypeInTuple<Tail, U>
    : never;

export type TupleIndexes<
  T extends ReadonlyUnion<AnyLike[]>,
  Acc extends number[] = [],
> =
  T extends ReadonlyUnion<[infer _, ...infer Rest]>
    ? TupleIndexes<Rest, [...Acc, Acc["length"]]>
    : Acc[number];
