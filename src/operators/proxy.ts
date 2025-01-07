import type { AnyLike, ObjectLike } from "../types";
import type { DeepReadonly } from "../types/object";
import { isProxy } from "./is";
import { isObject } from "./obj";
import { shallow } from "./shared";

/**
 * @description 让数据变成只读
 */
export const deepReadOnly = <T extends ObjectLike>(
  data: T,
): DeepReadonly<T> => {
  if (typeof data !== "object" || data === null) {
    return data as DeepReadonly<T>;
  }
  return new Proxy(data, {
    get: (target, prop) => {
      // 递归处理嵌套对象
      return deepReadOnly(target[prop as keyof typeof target] as ObjectLike);
    },
    set(_target, prop) {
      throw new Error(`只读属性不能修改: ${String(prop)}`);
    },
    deleteProperty(_target, prop) {
      throw new Error(`只读属性不能删除: ${String(prop)}`);
    },
  }) as DeepReadonly<T>;
};
/**
 * @description 深度冻结原对象，使其不可修改
 * @param {ObjectLike} data
 * @returns {typeof data}
 */
export const deepFreeze = <T extends ObjectLike>(data: T): T => {
  if (typeof data !== "object" || data === null) {
    return data;
  }
  Object.freeze(data); // 冻结对象
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      data[key] = deepFreeze(data[key] as ObjectLike) as T[Extract<
        keyof T,
        string
      >];
    }
  }
  return data;
};

/**
 * @description 创建的是深度响应式的代理对象
 * @description 可以动态地处理对象的变化，适合用于改变对象的属性时进行监听
 * @param {ObjectLike} data 代理对象
 * @param {(key: string | symbol, value: AnyLike, data: TData) => void} onChange 监听值变化的回调函数
 */
export const createDeepReactiveProxy = <TData extends ObjectLike>(
  data: TData,
  onChange: (key: string | symbol, value: AnyLike, data: TData) => void,
): TData => {
  const getProxyData = <TProxyData extends TData>(
    inputData: TProxyData,
  ): TProxyData => {
    return new Proxy(inputData, {
      set(obj, prop, value, receiver) {
        const oldValue = Reflect.get(obj, prop, receiver);
        // 深度代理
        if (typeof oldValue === "object" && oldValue !== null) {
          value = getProxyData(value);
        }
        // 判断是否有变化
        if (!shallow(oldValue, value)) {
          const flag = Reflect.set(obj, prop, value, receiver);
          onChange(prop, value, inputData);
          return flag;
        }
        return true;
      },
      get(obj, prop, receiver) {
        const value = Reflect.get(obj, prop, receiver);
        return typeof value === "object" && value !== null
          ? getProxyData(value as TData)
          : value;
      },
    });
  };
  return getProxyData(data);
};

/**
 * @description 创建的是深度响应式的代理对象
 * @param {ObjectLike} data 代理对象
 * @param {ProxyHandler} proxyConfig 监听值变化的回调函数
 */
export const createDeepProxy = <TData extends ObjectLike>(
  data: TData,
  proxyConfig: ProxyHandler<TData>,
): TData => {
  const getProxyData = <TProxyData extends TData>(
    inputData: TProxyData,
  ): TProxyData => {
    return new Proxy(inputData, {
      set(obj, prop, value, receiver) {
        const oldValue = Reflect.get(obj, prop, receiver);
        // 深度代理
        if (typeof oldValue === "object" && oldValue !== null) {
          value = getProxyData(value);
        }
        // 判断是否有变化
        if (!shallow(oldValue, value)) {
          const flag = proxyConfig.set?.(obj, prop, value, receiver) ?? false;
          return flag;
        }
        return true;
      },
      get(obj, prop, receiver) {
        const value = proxyConfig.get?.(obj, prop, receiver);
        return typeof value === "object" && value !== null
          ? getProxyData(value as TData)
          : value;
      },
      defineProperty(obj, prop, descriptor) {
        const flag =
          proxyConfig.defineProperty?.(obj, prop, descriptor) ?? false;
        return flag;
      },
    });
  };
  return getProxyData(data);
};
/**
 * @description 把proxy对象转换成普通对象
 * @param {unknown} proxy 要转换的proxy对象
 * @example
 * const proxy = new Proxy({}, {
 *   get(target, prop) {
 *     return prop === "a"? 1 : target[prop]; // 假设a属性的值是1
 *   },
 * });
 * const plainObject = proxyToPlainObject(proxy); // { a: 1 }
 */
export function proxyToPlainObject(proxy: unknown = {}) {
  if (!isProxy(proxy)) {
    return proxy;
  }
  const result = {};
  for (const key of Reflect.ownKeys(proxy)) {
    const value = proxy[key as keyof typeof proxy];
    Reflect.set(
      result,
      key,
      isObject(value) ? proxyToPlainObject(value) : value,
    );
  }
  return result;
}
