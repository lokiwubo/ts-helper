import { ObjectLike } from "../types";
import { DeepReadonly } from "../types/object";

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
