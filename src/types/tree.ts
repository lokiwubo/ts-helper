import type { RecordLike } from "./like";
import type { AllKeys } from "./object";

/**
 * @description 处理单个情况
 */
type FlattenTreeItemHelper<
  T extends RecordLike,
  Collectors extends RecordLike[] = [],
  K extends string = "children",
> = T[K] extends RecordLike[]
  ? [T, ...FlattenTreeListHelper<T[K], Collectors, K>]
  : [T, ...Collectors];

type FlattenTreeItems<
  A extends RecordLike,
  Collectors extends RecordLike[] = [],
  K extends string = "children",
  V = [...FlattenTreeItemHelper<A, [], K>, ...Collectors],
> = V extends RecordLike[] ? V : [];
/**
 * @description 处理数组情况
 */
type FlattenTreeListHelper<
  T extends RecordLike[],
  Collectors extends RecordLike[] = [],
  K extends string = "children",
> = T extends [infer A extends RecordLike]
  ? FlattenTreeItems<A, Collectors, K>
  : T extends [infer A extends RecordLike, ...infer B extends RecordLike[]]
    ? FlattenTreeListHelper<B, FlattenTreeItems<A, Collectors, K>, K>
    : Collectors;

/**
 * @description Flatten 把树形结构转化为扁平结构
 * @param T 结构树对象 可以是对象和数组
 * @param K 包含子节点的key 默认为children
 * @example
 * type Tree = {
 *   id: number;    // 节点id
 *   name: string;  // 节点名称
 *   children: Tree[]; // 子节点数组
 * }
 * type FlattenTree = FlattenTree<Tree[], "children">; // 扁平化后的树形结构
 */
export type FlattenTree<
  T extends RecordLike[],
  K extends AllKeys<T[number]> | keyof T[number],
> = T extends RecordLike
  ? FlattenTreeItemHelper<T, [], K & string>
  : FlattenTreeListHelper<T extends RecordLike[] ? T : [], [], K & string>;
