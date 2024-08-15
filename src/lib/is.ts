import { ArrayListLike, NumberLike } from "./like";
import { Abs, GenerateNumberUnion } from "./number";
import { Not, Or } from "./shared";
import { CharUnion, Stringify } from "./string";

export type IsAny<T> = 0 extends 1 & T ? true : false;

export type IsNever<T> = [T] extends [never] ? true : false;

type IsUnionHelper<A, B = A> = A extends A
  ? [B] extends [A]
    ? false
    : true
  : never;

export type IsUnion<A> = IsUnionHelper<A>;

export type IsTuple<T extends unknown[]> = number extends T["length"]
  ? false
  : true;

export type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <
  T1
>() => T1 extends B ? 1 : 2
  ? true
  : false;

export type IsExtendsRight<A, B> = A extends B ? true : false;

export type IsZero<N extends NumberLike> = IsExtendsRight<N, 0 | "0">;

export type IsOverZero<N extends NumberLike> = IsZero<N> extends true
  ? false
  : IsExtendsRight<
      Stringify<N> extends `${"-"}${infer Rest}` ? Rest : never,
      never
    >;

export type IsLessZero<N extends NumberLike> = Not<IsOverZero<N>>;

type IsOverHelper<
  T extends NumberLike,
  N extends NumberLike
> = GenerateNumberUnion<0, T> extends GenerateNumberUnion<0, N> ? false : true;

//目前只支持整数
export type IsOver<T extends NumberLike, N extends NumberLike> = IsEqual<
  IsOverZero<T>,
  IsOverZero<N>
> extends true
  ? IsEqual<T, N> extends true
    ? false
    : IsOverZero<T> extends true
    ? IsOverHelper<T, N>
    : Not<IsOverHelper<Abs<T>, Abs<N>>>
  : IsOverZero<T> extends true
  ? true
  : false;
// type isOver = IsOver<2, 2>;
//true

export type IsLess<T extends NumberLike, N extends NumberLike> = Not<
  IsOver<T, N>
>;

export type IsOverOrEqual<T extends NumberLike, N extends NumberLike> = Or<
  IsEqual<T, N>,
  IsOver<T, N>
>;

export type IsLessOrEqual<T extends NumberLike, N extends NumberLike> = Or<
  IsEqual<T, N>,
  IsLess<T, N>
>;

type FixedLengthHelper<
  T extends string,
  U extends ArrayListLike = []
> = T extends `${infer L}${infer R}` ? FixedLengthHelper<R, [...U, L]> : U;

export type IsFixedLengthString<
  T extends string,
  L extends number
> = FixedLengthHelper<`${T}`>["length"] extends L ? true : false;

export type IsFixedLengthNumber<
  T extends number,
  L extends number
> = IsFixedLengthString<`${T}`, L>;

export type IsFixedLengthArray<
  T extends ArrayListLike,
  L extends number
> = T["length"] extends L ? true : false;

export type IsFloat<N extends NumberLike> =
  Stringify<N> extends `${string}${"."}${infer Right}`
    ? CharUnion<Right> extends "0"
      ? false
      : true
    : false;
// type isFloat = IsFloat<'1.0000000'>;
//true

export type IsInit<N extends NumberLike> = Not<IsFloat<N>>;
