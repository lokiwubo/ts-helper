import { ArrayListLike, NumberLike } from "./like";
import { Abs, GenerateNumberUnion } from "./number";
import { Not, Or } from "./shared";
import { CharUnion, Stringify } from "./string";

/**
 * 判断是否为any类型
 * @example
 * IsAny(any)=> true
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;
/**
 * 判断是否为 never
 * @example
 * IsNever(never)=> true
 */
export type IsNever<T> = [T] extends [never] ? true : false;

type IsUnionHelper<A, B = A> = A extends A
  ? [B] extends [A]
    ? false
    : true
  : never;

/**
 * 判断是否为联合类型
 * @example
 * IsUnion<1 | 2>=> true
 */
export type IsUnion<A> = IsUnionHelper<A>;

/**
 * 判断是否为元组类型
 * @example
 * IsTuple<[1, 2]>=> true
 */
export type IsTuple<T extends unknown[]> = number extends T["length"]
  ? false
  : true;

/**
 * 判断是否相等
 * @example
 * IsEqual<1, 1>=> true
 */
export type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T1>() => T1 extends B ? 1 : 2
    ? true
    : false;
/**
 * 判断是否为 extends 右侧类型
 * @example
 * IsExtendsRight<1, number>=> true
 */
export type IsExtendsRight<A, B> = A extends B ? true : false;

/**
 * 判断是否为0
 * @example
 * IsZero(0)=> true
 */
export type IsZero<N extends NumberLike> = IsExtendsRight<N, 0 | "0">;

/**
 * 判断是否为正数
 * @example
 * IsOverZero(1)=> true
 */
export type IsOverZero<N extends NumberLike> =
  IsZero<N> extends true
    ? false
    : IsExtendsRight<
        Stringify<N> extends `${"-"}${infer Rest}` ? Rest : never,
        never
      >;
/**
 * 判断是否为负数
 * @example
 * IsLessZero(-1)=> true
 */
export type IsLessZero<N extends NumberLike> = Not<IsOverZero<N>>;

type IsOverHelper<T extends NumberLike, N extends NumberLike> =
  GenerateNumberUnion<0, T> extends GenerateNumberUnion<0, N> ? false : true;

/**
 * 判断是否为大于 目前只支持整数
 * @example
 * IsOver(2, 1)=> true
 */
export type IsOver<T extends NumberLike, N extends NumberLike> =
  IsEqual<IsOverZero<T>, IsOverZero<N>> extends true
    ? IsEqual<T, N> extends true
      ? false
      : IsOverZero<T> extends true
        ? IsOverHelper<T, N>
        : Not<IsOverHelper<Abs<T>, Abs<N>>>
    : IsOverZero<T> extends true
      ? true
      : false;

/**
 * 判断是否为大于
 * @example
 * IsOver(2, 2)=> false
 */
export type IsLess<T extends NumberLike, N extends NumberLike> = Not<
  IsOver<T, N>
>;

/**
 * 判断是否为大于等于
 * @example
 * IsOverOrEqual(2, 2)=> true
 */
export type IsOverOrEqual<T extends NumberLike, N extends NumberLike> = Or<
  IsEqual<T, N>,
  IsOver<T, N>
>;

/**
 * 判断是否为小于等于
 * @example
 * IsLessOrEqual(2, 2)=> true
 */
export type IsLessOrEqual<T extends NumberLike, N extends NumberLike> = Or<
  IsEqual<T, N>,
  IsLess<T, N>
>;

type FixedLengthHelper<
  T extends string,
  U extends ArrayListLike = [],
> = T extends `${infer L}${infer R}` ? FixedLengthHelper<R, [...U, L]> : U;

/**
 * 判断是否为固定长度字符串
 * @example
 * IsFixedLengthString("123", 3)=> true
 */
export type IsFixedLengthString<
  T extends string,
  L extends number,
> = FixedLengthHelper<`${T}`>["length"] extends L ? true : false;

/**
 * 判断是否为固定长度数字字符串
 * @example
 * IsFixedLengthNumber(123, 3)=> true
 */
export type IsFixedLengthNumber<
  T extends number,
  L extends number,
> = IsFixedLengthString<`${T}`, L>;

/**
 * 判断是否为固定长度数组
 * @example
 * IsFixedLengthArray([1, 2, 3], 3)=> true
 */
export type IsFixedLengthArray<
  T extends ArrayListLike,
  L extends number,
> = T["length"] extends L ? true : false;

/**
 * 判断是否为浮点数
 * @example
 * IsFloat(1)=> false
 */
export type IsFloat<N extends NumberLike> =
  Stringify<N> extends `${string}${"."}${infer Right}`
    ? CharUnion<Right> extends "0"
      ? false
      : true
    : false;

/**
 * 判断是否为整数
 * @example
 * IsInteger(1)=> true
 * IsInteger(1.0)=> false
 */
export type IsInit<N extends NumberLike> = Not<IsFloat<N>>;

/**
 * 判断是否为类
 * @example
 * IsClass(class A {})=> true
 */
export type IsClass<T> = T extends new (...args: any[]) => any ? true : false;
