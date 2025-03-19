import type { FillArray, Length, UnionFromArray } from "./array";
import type { IsFloat } from "./is";
import type { NumberLike } from "./like";

/**
 * @example
 * Add<1, 2> // 3
 */
export type Add<A extends number, B extends number> = Length<
  [...FillArray<A>, ...FillArray<B>]
> &
  number;

//减 暂时支持整数
export type Sub<A extends number, B extends number> =
  FillArray<A> extends [...infer Res, ...FillArray<B>] ? Length<Res> : never;

// 乘法
type MulHelper<
  A extends number,
  B extends number,
  Res extends number = 0,
> = A extends 0 ? Res : MulHelper<Sub<A, 1>, B, Add<Res, B>>;
export type Mul<A extends number, B extends number> = MulHelper<A, B>;

// 除法
type DivHelper<
  A extends number,
  B extends number,
  Res extends number = 0,
> = A extends 0 ? Res : DivHelper<Sub<A, B>, B, Add<Res, 1>>;
export type Div<A extends number, B extends number> = DivHelper<A, B>;

// 幂运算
export type Pow<
  A extends number,
  B extends number,
  Res extends number = 1,
> = B extends 0 ? Res : Pow<A, Sub<B, 1>, Mul<Res, A>>;

// 阶乘
export type Factorial<A extends number, Res extends number = 1> = A extends 0
  ? Res
  : Factorial<Sub<A, 1>, Mul<Res, A>>;

//取出数字
/**
 * @example
 * TrimFistZeroHelper<"01.100"> // "1.100"
 */
type TrimFistZeroHelper<T extends NumberLike> =
  `${T}` extends `0${infer V extends NumberLike}` ? TrimFistZeroHelper<V> : T;
/**
 * @example
 * TrimLastZeroHelper<"1.1000"> // "1.1"
 */
type TrimLastZeroHelper<T extends NumberLike> =
  `${T}` extends `${infer V extends NumberLike}0` ? TrimLastZeroHelper<V> : T;

type ToNumberHelper<
  T extends NumberLike,
  ISF extends boolean = IsFloat<T>,
  TrimT extends NumberLike = TrimFistZeroHelper<T>,
> = ISF extends true ? TrimLastZeroHelper<TrimT> : TrimT;
/**
 * @example
 * ToNumber<"1.1"> // 1.1
 * ToNumber<"1"> // 1
 */
export type ToNumber<T extends NumberLike> = T extends number
  ? T
  : ToNumberHelper<T> extends `${infer V extends number}`
    ? V
    : T;
// type a = ToNumber<"01.100">;
//1.1

//绝对值
/**
 * @example
 * Abs<"-123"> // 123
 */
export type Abs<T extends NumberLike> =
  `${T}` extends `-${infer V extends number}` ? V : ToNumber<T>;
// type abs = Abs<"-123">;

//值范围
type GenerateNumberHelper<
  S extends NumberLike,
  E extends NumberLike,
  Caches extends number[] = [],
> =
  ToNumber<S> extends ToNumber<E>
    ? [...Caches, ToNumber<S>]
    : GenerateNumberHelper<Add<ToNumber<S>, 1>, E, [...Caches, ToNumber<S>]>;

/**
 * @example
 * GenerateNumberHelper<10, 14> // [10, 11, 12, 13, 14]
 */
export type GenerateNumberUnion<
  S extends NumberLike,
  E extends NumberLike,
> = UnionFromArray<GenerateNumberHelper<S, E>>;

/**
 * @example
 * Max<6,4> // 6
 */
export type Max<T extends NumberLike, N extends NumberLike> =
  GenerateNumberUnion<0, T> extends GenerateNumberUnion<0, N> ? N : T;
// type max = Max<6,4>

/**
 * @example
 * Min<6,4> // 4
 */
export type Min<T extends NumberLike, N extends NumberLike> =
  GenerateNumberUnion<0, T> extends GenerateNumberUnion<0, N> ? N : T;

/**
 * @description 生成0-指定数字的联合类型
 * @example
 * NumberUnion<5> // 0 | 1 | 2 | 3 | 4 | 5
 */
export type NumberUnion<
  T extends number,
  Tuple extends number[] = [],
> = Tuple["length"] extends T
  ? Tuple[number]
  : NumberUnion<T, [...Tuple, Tuple["length"]]>;
