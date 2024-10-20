import { PackObject } from './object';

export type NumberLike = number | `${number}`;
export type ColorLike =
  | `#${number}`
  | `rgba(${number},${number},${number},${number})`
  | `rgb(${number},${number},${number})`;
type PixelUnit = 'px' | 'vw' | 'vh' | 'em' | 'rem';

export type PixelLike = `${number}${
  | Uppercase<PixelUnit>
  | Lowercase<PixelUnit>}`;

export type StringDateLike = `${string[24]}`;

export type NumberDateLike = number;

export type NumberCountLike = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type EmptyStringLike = ' ' | '\t' | '\n';

export type FunctionLike = (...arg: unknown[]) => unknown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecordKeyLike = keyof any;

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
export type ArrayListLike<T = unknown> = T[];

export type ArrayOrOnlyLike<T = unknown> = T[] | T;

export type UrlValueLike = string | number | boolean | null;

export type PointLike = PackObject<'x' | 'y', number>;

export type BoundingClientLike = PackObject<
  'x' | 'y' | 'width' | 'height' | 'left' | 'right' | 'top' | 'right',
  number
>;
