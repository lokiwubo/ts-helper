import type { EntriesKeyLike } from "./like";
import type { ReadonlyUnion } from "./shared";

/**
 * @example
 *  type mapFromTuple = MapFromTuple<[{ id: number; name: string }, { id: number; age: number }], "id"> => { "1": { id: 1, name: "Alice" }, "2": { id: 2, age: 30 } }
 */
export type MapFromTuple<
  T extends ReadonlyUnion<unknown[]>,
  K extends keyof T[number],
> = {
  [Item in T[number] as `${Item[K] & string}`]: Item;
};

/**
 * @description
 * @example
 *  type mapFromEntriesTuple = MapFromEntriesTuple<[["id", 1], ["name", "Alice"], ["id", 2], ["age", 30]]> => { "1": 1, "2": 2 }
 */
export type MapFromEntriesTuple<
  T extends
    | ReadonlyUnion<[EntriesKeyLike, unknown][]>
    | ReadonlyUnion<[...Array<[EntriesKeyLike, unknown]>]>,
> = {
  [Item in T[number] as `${Item extends [EntriesKeyLike, unknown]
    ? Item[0]
    : never}`]: Item[1];
};
