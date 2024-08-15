export type MiddlewareFunType<TContext, TResponse> = (
  param: TContext,
  next: (param: TContext) => TResponse
) => TResponse;

export function middleware<TContext, TResponse = void>(
  funcs: MiddlewareFunType<TContext, TResponse>[]
) {
  return funcs
    .reverse()
    .reduce<(param: TContext) => TResponse>(
      (result, next) => (arg) => next(arg, result),
      (() => {}) as unknown as (param: TContext) => TResponse
    );
}

export type AsyncMiddlewareFunType<TContext, TResponse> = (
  param: TContext,
  next: (param: TContext) => Promise<TResponse>
) => Promise<TResponse>;

export function asyncMiddleware<TContext, TResponse = void>(
  funcs: AsyncMiddlewareFunType<TContext, TResponse>[]
) {
  return funcs.reverse().reduce<(param: TContext) => Promise<TResponse>>(
    (result, next) => (arg) => Promise.resolve(next(arg, result)),
    () => Promise.resolve() as Promise<TResponse>
  );
}

export type ChainedFunType<TContext> = (param: TContext) => TContext;
export function chained<TContext>(funcs: ChainedFunType<TContext>[]) {
  return function (input: TContext) {
    return funcs.reduce(function (input, fn) {
      return fn(input);
    }, input);
  };
}

//示例
// chained<number>([
//   function f1(x) {
//     return x * 2;
//   },
// ])?.(0);

// middleware<number, string>([(a, next) => {
//   next(a);
//   return ''
// }])(1);

// asyncMiddleware<{ name: string }, string>([
//   async (data, next) => {
//     console.log("enter 1");
//     await next(data);
//     console.log("exit 1");
//     return ''
//   },
// ])({ name: "Lucy" });
