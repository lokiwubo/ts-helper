import { AnyLike } from "../types/like";

export type MiddlewareFunType<TContext, TResponse> = (
  context: TContext,
  next: (context: TContext) => TResponse,
) => TResponse;

export function middleware<TContext, TResponse = void>(
  funcs: MiddlewareFunType<TContext, TResponse>[],
) {
  return funcs
    .reverse()
    .reduce<
      (context: TContext) => TResponse
    >((result, next) => (arg) => next(arg, result), (() => {}) as unknown as (context: TContext) => TResponse);
}

export type AsyncMiddlewareFunType<TContext, TResponse> = (
  param: TContext,
  next: (param: TContext) => Promise<TResponse>,
) => Promise<TResponse>;

export function asyncMiddleware<TContext, TResponse = void>(
  funcs: AsyncMiddlewareFunType<TContext, TResponse>[],
) {
  return funcs.reverse().reduce<(param: TContext) => Promise<TResponse>>(
    (result, next) => (arg) => Promise.resolve(next(arg, result)),
    () => Promise.resolve() as Promise<TResponse>,
  );
}

type ChainedFunType<TValue> = (value: TValue) => TValue;
/**
 * @description 链式函数
 * @example chained([fn1, fn2, fn3])(input) === fn3(fn2(fn1(input)))
 */
export function chained<TValue, TChained extends ChainedFunType<TValue>>(
  funcs: TChained[],
) {
  return function (input: TValue) {
    return funcs.reduce(function (total, fn) {
      return fn(total);
    }, input);
  };
}

/**
 * @name 拦截器
 * @description 多个异步函数拦截器，只要有一个函数返回true，则中断后续函数执行并返回true，否则返回false
 * @example guard([fn1, fn2, fn3])(input) === fn1(input) && fn2(input) && fn3(input)
 */
type ComposeInputType = (...args: AnyLike[]) => Promise<boolean>;

export async function runGuards<
  T extends ComposeInputType,
  TVale extends AnyLike[],
>(promises: T[], ...args: TVale) {
  async function runPromises(promises: T[]) {
    for (const promise of promises) {
      const result = await promise(...args);
      if (result === true) {
        return true;
      }
    }
    return false;
  }
  return await runPromises(promises);
}
