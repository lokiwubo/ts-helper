import type {
  AllKeys,
  AnyLike,
  FilterByKey,
  ReadonlyUnion,
  RecordLike,
  SeniorMutable,
} from "../types";
import type { FlattenTree } from "../types/tree";

/**
 * @description 将树形结构的路由数据展平为一维数组
 * @param dateTree 路由树
 * @param key 要展平的键 children | routes 的key
 */
export const getFlattenByTree = <
  T extends ReadonlyUnion<RecordLike[]>,
  K extends AllKeys<T[number]>,
>(
  dateTree: T,
  key: K,
): FlattenTree<SeniorMutable<T>, K & string> => {
  return [dateTree].flat().reduce((prev, curr) => {
    if (curr[key] && Array.isArray(curr[key])) {
      return [...prev, curr, ...getFlattenByTree(curr[key], key)];
    }
    return [...prev, curr];
  }, [] as AnyLike) as AnyLike;
};

/**
 * @description 根据 flagKey 过滤出对应数据
 */
export const filterByFlagKey = <
  T extends RecordLike[],
  K extends AllKeys<T[number]> = AllKeys<T[number]>,
>(
  dataList: T,
  flagKey: K,
) => {
  return dataList.filter((item) => item.hasOwnProperty(flagKey)) as FilterByKey<
    T,
    K
  >;
};
