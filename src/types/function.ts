import type { AnyLike, FunctionLike } from "./like";
import type { Prettify } from "./shared";

/**
 * @description 重新给函数绑定指定this 指向
 * 类似 type ObjectDescriptor<D, M> = {
    methods?: M & ThisType<D & M>;  // 方法中的 `this` 类型被设置为 D & M
};
 * @example type bound = MoveFunctionThis<(b:2) => void, {a:1}>;
 */
export type MoveFunctionThis<
  TFun extends FunctionLike,
  TThis extends {},
> = Prettify<
  TFun & {
    prototype: TThis;
  }
>;

export interface CallableFunction {
  call<T, A extends AnyLike[], R>(
    this: (this: T, ...args: A) => R,
    thisArg: T,
    ...args: A
  ): R;
}

export interface BindableFunction {
  bind<T, A extends AnyLike[], R>(
    this: (this: T, ...args: A) => R,
    thisArg: T,
    ...args: A
  ): (this: T, ...args: A) => R;
}

export type FunctionType<T extends AnyLike> = T extends FunctionLike
  ? T
  : never;

/**
 * @description 获取函数的接口类型
 * @example type fn = FunctionInterface<(a:1) => void>;
 */
export type FunctionInterface<T extends FunctionLike> =
  T extends CallableFunction
    ? CallableFunction
    : T extends BindableFunction
      ? BindableFunction
      : never;
