import type { PackObject } from "./object";

export type NumberLike = number | `${number}`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLike = any;

export type ColorLike =
  | `#${number}`
  | `rgba(${number},${number},${number},${number})`
  | `rgb(${number},${number},${number})`
  | `hsl(${number},${number}%,${number}%)`
  | `hsla(${number},${number}%,${number}%,${number})`
  | `hsv(${number},${number}%,${number}%)`;

export type LengthUnit = "px" | "em" | "rem" | "vw" | "vh" | "%";

export type LengthLike = `${number}${
  | Uppercase<LengthUnit>
  | Lowercase<LengthUnit>}`;

export type StringDateLike = `${string[24]}`;

export type NumberDateLike = number;

export type NumberCountLike = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type EmptyStringLike = " " | "\t" | "\n" | "\r" | "";

export type FunctionLike = (...arg: AnyLike[]) => AnyLike;

export type RecordKeyLike = keyof AnyLike;

export type ObjectLike = {} | AnyLike[];

export type EntriesKeyLike = string | number | boolean | undefined | null;

export type StringifiedLike =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

export type RecordValueLike =
  | string
  | number
  | symbol
  | undefined
  | boolean
  | null
  | object;

export interface RecordLike {
  [propName: RecordKeyLike]: unknown;
}
export type ArrayListLike<T = AnyLike> = T[];

export type ArrayOrOnlyLike<T = AnyLike> = T[] | T;

export type UrlValueLike = string | number | boolean | null;

export type PointLike = PackObject<"x" | "y", number>;

export type BoundingClientLike = PackObject<
  "x" | "y" | "width" | "height" | "left" | "right" | "top" | "right",
  number
>;

// 定义一个类型来表示类构造函数
export type ClassLike<T = AnyLike> = new (...args: AnyLike[]) => T;

// 定义一个类型来表示promise对象
export type promiseLike<T = AnyLike> = Promise<T>;
