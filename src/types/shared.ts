import type { AnyLike, ArrayListLike, RecordLike } from "./like";
import type { DeepMutable } from "./object";

/**
 * @description
 * @example type many = Many<1|2|3|4>; => 1|2|3|4|Array<1|2|3|4>
 */
export type Many<T> = T | T[];

/**
 * @description 提取数组中的联合类型
 * @example type few = Few<(1|2|3|4)[]>; => 1|2|3|4
 */
export type Few<T> = T extends (infer A)[] ? A : T;
/**
 * @description 取反
 * @example type not = Not<true>; => false
 */
export type Not<C extends boolean> = C extends true ? false : true;
/**
 * @description 与运算
 * @example type and = And<true, true>; => true
 */
export type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;
/**
 * @description 或运算
 * @example type or = Or<true, false>; => true
 */
export type Or<A extends boolean, B extends boolean> = A extends true
  ? false
  : B extends true
    ? true
    : false;

/**
 * @description 类型断言
 * @example type assert = TypeAssert<1, 1>; => 1
 */
export type TypeAssert<T, A> = T extends A ? T : never;

/**
 * @description 过滤掉null和undefined
 * @example type nonNullable = SeniorNonNullable<string | null | undefined>; => string
 */
export type SeniorNonNullable<T> = Exclude<T, undefined | null>;

/**
 * @description 把只读类型转为可写类型
 * @example type writable = SeniorMutable<Readonly<{a:1}>>;
 */
export type SeniorMutable<T> =
  T extends Readonly<infer U>
    ? U extends ArrayListLike | Readonly<U>
      ? U extends readonly [...infer A]
        ? A
        : U
      : U extends RecordLike
        ? DeepMutable<U>
        : U
    : T;

/**
 * @description 转变为只读的联合类型
 * @example type readonlyUnion = ReadonlyUnion<1|2|3|4>; => (1|2|3|4)|readonly(1|2|3|4)
 */
export type ReadonlyUnion<T> = Readonly<T> | T;

/**
 * @description 变为交集类型
 * @example type interFunction = UnionToInterFunction<"a"| string | boolean> => (() => string) & (() => false) & (() => true)
 */
export type UnionToInterFunction<U> = (
  U extends AnyLike ? (k: () => U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
//  type interFunction=  UnionToInterFunction<"a"| string | boolean>
//  => (() => string) & (() => false) & (() => true)

/**
 * @description 获取联合类型中的最后一个类型
 * @example type last = LastFromUnion<1|2|3|4>; => 4
 */
export type LastFromUnion<
  T,
  U = UnionToInterFunction<T>,
> = U extends () => AnyLike ? ReturnType<U> : never;

/**
 * @description 去除最后一个类型
 * @example type withoutLast = OmitLastFormUnion<1|2|3|4>; => 1|2|3
 */
export type OmitLastFormUnion<T> = Exclude<T, LastFromUnion<T>>;
/**
 * @description 获取Promise的类型
 * @example type promiseType = GetPromiseType<Promise<string>> => string;
 */
export type GetPromiseType<T> = T extends Promise<infer Return> ? Return : T;

/**
 * @description 获取Promise的返回值类型
 * @example type promiseType = ReturnPromiseType<() => Promise<string>> => string;
 */
export type ReturnPromiseType<T> = T extends () => Promise<infer Return>
  ? Return
  : T;

/**
 * @description 联合类型转为元组类型
 * @example type tuple = UnionToTuple<1|2|3|4> => [1, 2, 3, 4];
 */
export type UnionToTuple<T> =
  UnionToInterFunction<T> extends () => infer ReturnType
    ? [...UnionToTuple<Exclude<T, ReturnType>>, ReturnType]
    : [];

/**
 * 联合类型去除undefined
 * @example type nonUndefined = NonUndefined<string | undefined>;
 */
export type NonUndefined<T> = T extends undefined ? never : T;

/**
 * @name PromiseOrType
 */
export type PromiseEither<T> = Promise<T> | T;

/**
 * @example
 * ExtractNumber<"123"> // 123
 */
export type ExtractNumber<T extends `${number}` | string> =
  T extends `${infer N}` ? (N extends number ? N : never) : never;

/**
 * 提取类类型
 * @example
 * class MyClass {
 *   a=1;
 *   b=2;
 * }
 * type ExtractClass = ExtractClass<typeof MyClass>;
 */
export type ExtractClass<T> = T extends new (...args: AnyLike[]) => infer R
  ? R
  : never;

/**
 * 提取类类型
 * @example
 * type extractPromise = ExtractPromise<Promise<string>>;
 */
export type ExtractPromise<T> = T extends Promise<infer R> ? R : T;
