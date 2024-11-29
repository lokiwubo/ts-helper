import { AllKeys, FilterByKey, ReadonlyUnion, RecordLike, SeniorMutable } from "../types";
import { FlattenTree } from "../types/tree";

export const getFlattenByTree = <
  T extends ReadonlyUnion<RecordLike[]>,
  K extends AllKeys<T[number]>,
>(
  routerTree: T,
  key: K,
): FlattenTree<SeniorMutable<T>, K & string> => {
  return [routerTree].flat().reduce((prev, curr) => {
    if (curr[key] && Array.isArray(curr[key])) {
      return [...prev, curr, ...getFlattenByTree(curr[key], key)];
    }
    return [...prev, curr];
  }, [] as any) as any;
};

export const filterByFlagKey = <
  T extends RecordLike[],
  K extends AllKeys<T[number]> = AllKeys<T[number]>,
>(
  routes: T,
  flagKey: K,
) => {
  return routes.filter((item) => item.hasOwnProperty(flagKey)) as FilterByKey<
    T,
    K
  >;
};
