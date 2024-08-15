import {
  ArrayListLike,
  StringifiedLike,
} from "./like";
import { Add, Sub } from "./number";
import {  ReturnPromiseType } from "./shared";

export type SetArray<T> = T extends ArrayListLike ? [...T] : [T];

export type ArrayConcat<T, A> = [...SetArray<T>, ...SetArray<A>];

export type Push<Tuple extends unknown[], R> = Tuple extends [...infer T]
  ? [...T, R]
  : never;

export type Prepend<Tuple extends ArrayListLike, E> = [E, ...Tuple];

export type Shift<T extends ArrayListLike> = T extends [unknown, ...infer A]
  ? A
  : [];

export type Pop<T extends ArrayListLike> = T extends [...infer A, unknown]
  ? A
  : [];

type SeniorShiftHelper<
  T extends ArrayListLike,
  N extends number,
  C extends number = 0
> = C extends N ? T : SeniorShiftHelper<Shift<T>, N, Add<C, 1>>;

export type SeniorShift<
  T extends ArrayListLike,
  N extends number
> = SeniorShiftHelper<T, N>;

// type seniorShift = SeniorShift<[1,2,3,4,5,6],2>
// [3, 4, 5, 6]

type SeniorPopHelper<
  T extends ArrayListLike,
  N extends number,
  C extends number = 0
> = C extends N ? T : SeniorPopHelper<Pop<T>, N, Add<C, 1>>;

export type SeniorPop<
  T extends ArrayListLike,
  N extends number
> = SeniorPopHelper<T, N>;
// type seniorShift = SeniorPop<[1,2,3,4,5,6],2>
// [3, 4, 5, 6]

type SliceHelper<
  A extends ArrayListLike,
  S extends number,
  E extends number = Length<A>
> = S extends E ? [] : SeniorShift<SeniorPop<A, Sub<Length<A>, E>>, S>;

export type Slice<
  T extends ArrayListLike,
  S extends number,
  E extends number = Length<T>
> = SliceHelper<T, S, E>;

export type UnShift<T extends ArrayListLike, A> = [...T, A];

export type UnionFromArray<T> = T extends (infer U)[] ? U : never;

type JoinHelper<
  A extends StringifiedLike[],
  U extends string = "",
  C extends string = ""
> = Length<A> extends 0
  ? C
  : JoinHelper<
      Slice<A, 1>,
      U,
      C extends "" ? `${First<A>}` : `${C}${U}${First<A>}`
    >;

export type Join<
  T extends StringifiedLike[],
  U extends string = ""
> = JoinHelper<T, U>;

// type join = Join<[1, 2, 3, 4], "-">;
//"1-2-3-4"

type ReturnPromiseArrayHelper<
  T extends (() => Promise<unknown>)[],
  R extends ArrayListLike = []
> = T extends [infer U, ...infer O]
  ? O extends (() => Promise<unknown>)[]
    ? ReturnPromiseArrayHelper<O, [...R, ReturnPromiseType<U>]>
    : R
  : R;
export type ReturnPromiseArray<T extends (() => Promise<unknown>)[]> =
  ReturnPromiseArrayHelper<T>;
//  type returnPromiseArray = ReturnPromiseArray<[()=>Promise<string>, ()=>Promise<1>,()=>Promise<2>,()=>Promise<null>]>
// [string, 1, 2, null]

export type FindFormIndex<
  T extends ArrayListLike,
  I extends number
> = T extends [infer U, ...infer O]
  ? I extends 0
    ? U
    : FindFormIndex<O, Sub<I, 1>>
  : undefined;
// type findFormArray = FindFormIndex<[1, 2, 3, 4, 5], [1, 2, 3, 4, 5]["length"]>;
//1

type FirstHelper<
  Tuple extends ArrayListLike,
  U = FindFormIndex<Tuple, 0>
> = U extends undefined ? Tuple[number] : U;

export type First<Tuple extends ArrayListLike> = FirstHelper<Tuple>;
// type first = First<[1, 2, 3, 4, 5]>;
//1

type LastHelper<
  Tuple extends ArrayListLike,
  U = FindFormIndex<Tuple, Sub<Tuple["length"], 1>>
> = U extends undefined ? Tuple[number] : U;
export type Last<Tuple extends ArrayListLike> = LastHelper<Tuple>;
// type last = Last<[1, 2, 3, 4, 5]>;
//1

// 获取数组元素个数
export type Length<Tuple extends ArrayListLike> = Tuple["length"];

export type Includes<Tuple extends ArrayListLike, O> = O extends Tuple[number]
  ? true
  : false;

type IndexOfHelper<
  Tuple extends ArrayListLike,
  V,
  S extends number = 0
> = Tuple extends [infer F, ...infer Rest]
  ? F extends V
    ? S
    : IndexOfHelper<Rest, V, Add<S, 1>>
  : -1;

export type IndexOf<Tuple extends ArrayListLike, V> = IndexOfHelper<Tuple, V>;
// type indexOf = IndexOf<[1, 2, 3, 4, 5], 4>;
// 3

type ReverseHelper<
  Tuple extends ArrayListLike,
  Cache extends ArrayListLike = []
> = Tuple["length"] extends 0
  ? Cache
  : Tuple extends [...infer Rest, infer F]
  ? ReverseHelper<Rest, Push<Cache, F>>
  : Cache;
export type Reverse<Tuple extends ArrayListLike> = ReverseHelper<Tuple>;
// type reverse = Reverse<[1, 2, 3, 4, 5]>;
//  [5, 4, 3, 2, 1]

type FillArrayHelper<
  T extends number,
  U extends ArrayListLike = [],
  V = unknown
> = Length<U> extends T ? U : FillArrayHelper<T, Push<U, V>, V>;
export type FillArray<T extends number, V = unknown> = FillArrayHelper<T, [], V>;


//entries set Map
// type mapFromEntries = MapFromEntries<[[1, "a1"], [2, "b"]]>;
// =>  { 1: "a1"; 2: "b"; }
