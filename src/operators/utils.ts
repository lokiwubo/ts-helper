import type { DeepMutable, Mutable } from "../types";
import type { AnyLike, FunctionLike, PromiseFunctionLike } from "../types/like";
import type { NumberUnion } from "../types/number";
import type { DerivationType, Prettify } from "../types/shared";
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
 * @description 数组基于某个字段去操作
 * @param {any[] }list
 * @param {string }key
 * @returns
 */
export const getListOperator = <
  const T extends AnyLike[],
  TKey extends keyof T[number],
>(
  list: T,
  key: TKey,
) => {
  const createAction = <TList extends AnyLike[]>(data: TList) => {
    type TKeyValueUnion = TList[number][TKey];
    return {
      /**
       * @description 需要排除掉的数据
       * @param {Record<string, boolean>} mask
       * 为 true 排除掉
       */
      omit: <TMask extends Partial<{ [K in TKeyValueUnion]: boolean }>>(
        mask: TMask,
      ) => {
        type OmitValueType = Prettify<{
          [K in keyof TMask as TMask[K] extends true ? K : never]: TMask[K];
        }>;
        type OmitTuple<T extends AnyLike[], U> = T extends [
          infer First extends TList[number],
          ...infer Rest,
        ]
          ? `${First[TKey]}` extends U
            ? OmitTuple<Rest, U>
            : [First, ...OmitTuple<Rest, U>]
          : [];
        const omittedData = data.filter(
          (item) => !mask[item[key] as TKeyValueUnion],
        ) as OmitTuple<TList, keyof OmitValueType>;
        return createAction(omittedData);
      },
      /**
       * @description 提取需要的数据
       * @param {Record<string, boolean>} mask
       * 为 ture 需要的数据
       */
      pick: <TMask extends Partial<{ [K in TKeyValueUnion]: boolean }>>(
        mask: TMask,
      ) => {
        type PickValueType = {
          [K in keyof TMask as TMask[K] extends true ? K : never]: TMask[K];
        };
        type PickTuple<T extends AnyLike[], U> = T extends [
          infer First extends TList[number],
          ...infer Rest,
        ]
          ? `${First[TKey]}` extends U
            ? [First, ...PickTuple<Rest, U>]
            : [...PickTuple<Rest, U>]
          : [];
        const pickedData = data.filter(
          (item) => mask[item[key] as TKeyValueUnion],
        ) as PickTuple<TList, keyof PickValueType>;
        return createAction(pickedData);
      },
      /**
       * @description 合并
       * @param {TList[number]} addData 要合并的数据
       */
      merge: <
        const TData extends {
          [K in keyof TList[number]]: DerivationType<TList[number][K]>;
        },
      >(
        addData: TData,
      ) => {
        return createAction([...data, addData] as [...TList, TData]);
      },
      /**
       * @description 排序
       * @param {TKeyValueUnion[]} sorts  key 对应值的数组
       */
      sort: <const TSorts extends TKeyValueUnion[]>(sorts: TSorts) => {
        type SortTuple<
          T extends AnyLike[],
          U extends TKeyValueUnion[],
          TFirst extends AnyLike[number] = T extends [infer A, ...infer _B]
            ? A
            : never,
          TRest extends AnyLike[] = T extends [infer _A, ...infer B]
            ? B
            : never,
          TFirstSort = U extends [infer A, ...infer _B] ? A : never,
          TRestSort extends TKeyValueUnion[] = U extends [
            infer _A,
            ...infer B extends TKeyValueUnion[],
          ]
            ? B
            : never,
        > = U["length"] extends 0
          ? T
          : TFirst[TKey] extends TFirstSort
            ? [TFirst, ...SortTuple<TRest, TRestSort>]
            : [...SortTuple<[...TRest, TFirst], U>];

        const sortedData = data.sort((a, b) => {
          const indexA = sorts.indexOf(a[key]);
          const indexB = sorts.indexOf(b[key]);
          return indexA - indexB;
        }) as SortTuple<TList, TSorts>;
        return createAction(sortedData);
      },
      getData: () => data,
      getDataByValue: <TValue extends TKeyValueUnion>(keyValue: TValue) => {
        type FindTypeInTuple<T, U> = T extends []
          ? never
          : T extends [infer TFirst, ...infer Tail]
            ? TFirst extends U
              ? TFirst
              : FindTypeInTuple<Tail, U>
            : never;
        return data.find(
          (item) => item[key] === keyValue,
        ) as unknown as FindTypeInTuple<TList, { [K in TKey]: TValue }>;
      },
      getValuesByKey: <
        TKey extends keyof TList[number],
        TValue extends TList[number][TKey],
      >(
        key: TKey,
        defaultValue?: TValue,
      ) => {
        type MapTuple<
          TData extends AnyLike[],
          TKey extends keyof TData[number],
          TFirst extends AnyLike[number] = TData extends [infer A, ...infer _B]
            ? A
            : never,
          TRest extends AnyLike[] = TData extends [infer _A, ...infer B]
            ? B
            : never,
        > = TData["length"] extends 0
          ? []
          : [TFirst[TKey], ...MapTuple<TRest, TKey>];
        return data.map((item) => item[key] ?? defaultValue) as MapTuple<
          TList,
          TKey
        >;
      },
      at: <TIndex extends number = NumberUnion<TList["length"]>>(
        count: TIndex,
      ) => {
        return data.at(count) as TList[TIndex];
      },
    };
  };
  return createAction<T>(list);
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

interface ActionLike {
  name: string;
  do: (...ags: AnyLike[]) => AnyLike;
  where?: () => boolean;
}
/**
 * @todo 还在构思
 * @description 用来执行actions
 * @param {ActionLike[]} actions
 */
export const execAction = <TActions extends ActionLike[]>(
  actions: TActions,
) => {
  const createContext = <TValue>(value: TValue) => {
    const contextKey = Symbol.for("context");
    return {
      [contextKey]: value,
      get value() {
        return this[contextKey];
      },
      set value(value) {
        this[contextKey] = value;
      },
    };
  };
  const createOperator = <TActions extends ActionLike[]>(actions: TActions) => {
    return {
      /**
       * serial: 按顺序串行执行
       */
      serial: <TValue>(value?: TValue) => {
        const context = createContext(value);
        for (const action of actions) {
          if (action.where && !action.where()) {
            continue;
          }

          context.value = action.do(context.value);
        }
      },
      /**
       * someSerial: 只要条件为真就不往下执行
       */
      someSerial: <TValue>(value?: TValue) => {
        const context = createContext(value);
        const item = actions.find((item) => item.where && item.where());
        if (item) {
          item.do(context.value);
        }
      },
      /**
       * 并行执行
       */
      parallel: <TValue>(value?: TValue) => {
        for (const action of actions) {
          if (action.where && !action.where()) {
            continue;
          }
          setTimeout(() => action.do(value));
        }
      },
      /**
       * parallel: 并行执行
       */
    };
  };
  return createOperator(actions);
};
