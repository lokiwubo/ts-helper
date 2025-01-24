import type { AnyLike } from "./like";

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

/**
 * 提取params参数为联合类型
 * @example type extractDynamicUrlParams= ExtractDynamicUrlParams<"/a/:b/:c"> => "b|c"
 */
export type ExtractDynamicUrlParams<T extends string> =
  T extends `${infer _Start}/:${infer Param}/${infer Rest}`
    ? Param | ExtractDynamicUrlParams<`/${Rest}`>
    : T extends `${infer _Start}/:${infer Param}`
      ? Param | ExtractDynamicUrlParams<`/${Param}`>
      : never;
