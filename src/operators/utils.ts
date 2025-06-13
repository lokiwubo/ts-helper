import type { DeepMutable, Mutable } from "../types";
import type { AnyLike, FunctionLike, PromiseFunctionLike } from "../types/like";
import { isAsyncFunction } from "./is";

export const createHash = (data: unknown) => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${hash.toString(32)}`;
};

/**
 * @description 延时
 * @param {number } ms
 */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @description 修改类型为可变对象
 */
export const getMutable = <T>(data: T): Mutable<T> => {
  return data as Mutable<T>;
};
/**
 * @description 递归修改类型为可变对象
 */
export const getDeepMutable = <T>(data: T): DeepMutable<T> => {
  return data as DeepMutable<T>;
};

/**
 * @description 非阻塞 try catch
 * @returns{ { data: unknown, error: null } | { data: null, error: unknown }}
 */
export const tryCatch = async <
  T extends FunctionLike | PromiseFunctionLike,
  E = Error,
>(
  action: T,
  ...args: Parameters<T>
) => {
  try {
    let result;
    if (isAsyncFunction(action)) {
      result = await action(...args);
    } else {
      result = action(...args);
    }
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as E,
    };
  }
};

/**
 * @description cache 缓存
 * @param {Function} doAction 要缓存的函数
 * @param {number} [cacheTime] 缓存时间
 *   - undefined: 缓存永久
 *   - 0: 不缓存
 *   - 其他值: 缓存时间
 */
export const cache = <TAction extends FunctionLike | PromiseFunctionLike>(
  doAction: TAction,
  cacheTime?: number,
) => {
  const cacheResult = new Map<
    string,
    {
      time: number;
      data: ReturnType<TAction>;
    }
  >();
  const isAsyncFunction = (
    func: FunctionLike | PromiseFunctionLike,
  ): func is PromiseFunctionLike => {
    return (
      func.constructor.name === "AsyncFunction" ||
      Object.prototype.toString.call(func) === "[object AsyncFunction]"
    );
  };
  const setCache = (key: string, data: ReturnType<TAction>) => {
    cacheResult.set(key, {
      time: Date.now(),
      data: data,
    });
  };
  return (
    ...args: Parameters<TAction>
  ): TAction extends PromiseFunctionLike
    ? Promise<Awaited<ReturnType<TAction>>>
    : ReturnType<TAction> => {
    const key = createHash(args);
    const cacheData = cacheResult.get(key);
    /**
     * cacheTime 为 undefined 是永久缓存
     * cacheTime 为 0 是不缓存
     * cacheTime 为其他值 是缓存时间
     */
    if (
      cacheData &&
      ((cacheTime !== undefined && Date.now() - cacheData.time < cacheTime) ||
        cacheTime === undefined)
    ) {
      if (isAsyncFunction(doAction)) {
        if ((cacheData.data as AnyLike) instanceof Promise) {
          return cacheData.data as ReturnType<TAction>;
        }
        return Promise.resolve(cacheData.data) as AnyLike;
      }
      return cacheData.data;
    }
    const result = doAction(...args);
    /**
     * 判断是否未异步函数
     */
    setCache(key, result);
    if (result instanceof Promise) {
      result.then((data) => {
        setCache(key, data);
      });
    }
    return result;
  };
};

/**
 * @description 定义数据处理操作方法
 * @param {TInput} value 要处理的数据
 * @example const result = defineOperator(10).pie((value, { map }) =>
    map((value) => `${value}` ),
  ).value; // "10"
 */
export const defineOperator = <const TInput>(value: TInput) => {
  const createOperator = <const TValue>(value: TValue) => ({
    map: <const TOutput>(action: (value: TValue) => TOutput): TOutput => {
      return action(value);
    },
  });
  const createActions = <const TValue>(value: TValue) => {
    return {
      pie: <
        TAction extends (
          value: TValue,
          operators: ReturnType<typeof createOperator<TValue>>,
        ) => AnyLike,
      >(
        doAction: TAction,
      ) => {
        const result = doAction(
          value,
          createOperator(value),
        ) as ReturnType<TAction>;
        return createActions(result);
      },
      get value() {
        return value as TValue;
      },
    };
  };
  return createActions(value);
};
