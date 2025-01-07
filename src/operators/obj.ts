import type { RecordLike } from "../types/like";
import type {
  MultiMerge,
  ObjectEntries,
  ObjectKeyUnion,
  ObjectValueUnion,
} from "../types/object";

export function keys<T extends {}>(obj: T) {
  return Object.keys(obj) as ObjectKeyUnion<T>[];
}

export function entries<T extends {}>(obj: T) {
  return Object.entries(obj) as ObjectEntries<T>;
}

export function values<T extends {}>(obj: T) {
  return Object.values(obj) as ObjectValueUnion<T>[];
}

export function isObject(obj: unknown): obj is Record<string, unknown> {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}

export function defineGetter<TObject, TKey extends keyof TObject>(
  obj: TObject,
  keyName: TKey,
  get: () => TObject[TKey],
): void {
  Object.defineProperty(obj, keyName, {
    get,
    enumerable: false,
    configurable: true,
  });
}

export function assign<T extends {}[]>(...args: T): MultiMerge<T> {
  return Object.assign({}, ...args);
}

export function overwrite<TObject, TRewire extends Partial<TObject>>(
  obj: TObject,
  reWriteObject: TRewire,
): TObject {
  return Object.assign({}, obj, reWriteObject);
}

export function omit<TObject extends RecordLike, TKey extends keyof TObject>(
  data: TObject,
  keys: TKey[],
): Omit<TObject, TKey> {
  return Object.fromEntries(
    Object.entries(data).filter(([keyName]) => {
      return !keys.includes(keyName as TKey);
    }),
  ) as unknown as Omit<TObject, TKey>;
}

export function pick<TObject extends RecordLike, TKey extends keyof TObject>(
  data: TObject,
  keys: TKey[],
): Pick<TObject, TKey> {
  return Object.fromEntries(
    Object.entries(data).filter(([keyName]) => {
      return keys.includes(keyName as TKey);
    }),
  ) as unknown as Pick<TObject, TKey>;
}
