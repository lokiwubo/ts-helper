import { EntriesKeyLike } from "./like";
import { ReadonlyUnion } from "./shared";

export type MapFromTuple<
  T extends ReadonlyUnion<unknown[]>,
  K extends keyof T[number],
> = {
  [Item in T[number] as `${Item[K] & string}`]: Item;
};

/**
 * @description
 * @example
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
