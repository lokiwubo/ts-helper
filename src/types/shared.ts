import { ArrayListLike, RecordLike } from "./like";
import { DeepMutable } from "./object";

export type Many<T> = T | T[];

export type Few<T> = T extends (infer A)[] ? A : T;

export type Not<C extends boolean> = C extends true ? false : true;

export type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

export type Or<A extends boolean, B extends boolean> = A extends true
  ? false
  : B extends true
    ? true
    : false;

export type TypeAssert<T, A> = T extends A ? T : never;

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
 */
export type ReadonlyUnion<T> = Readonly<T> | T;

export type UnionToInterFunction<U> = (
  U extends any ? (k: () => U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
//  type interFunction=  UnionToInterFunction<"a"| string | boolean>
//  => (() => string) & (() => false) & (() => true)

export type LastFromUnion<T, U = UnionToInterFunction<T>> = U extends () => any
  ? ReturnType<U>
  : never;

export type OmitLastFormUnion<T> = Exclude<T, LastFromUnion<T>>;

export type GetPromiseType<T> = T extends Promise<infer Return> ? Return : T;

export type ReturnPromiseType<T> = T extends () => Promise<infer Return>
  ? Return
  : T;

export type UnionToTuple<T> =
  UnionToInterFunction<T> extends () => infer ReturnType
    ? [...UnionToTuple<Exclude<T, ReturnType>>, ReturnType]
    : [];
//  type unionToTuple = UnionToTuple<1|2|3|4>
//[1, 2, 3, 4]

// export type MapUnion<U, F extends(arg: any) => any> = U extends any ? F<U> : never;

/**
 * 联合类型去除undefined
 * @example type nonUndefined = NonUndefined<string | undefined>;
 */
export type NonUndefined<T> = T extends undefined ? never : T;
