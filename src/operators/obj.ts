import { produce } from "immer";
import { get, set } from "lodash-es";
import type { Prettify } from "../types";
import type { AnyLike, RecordLike } from "../types/like";
import type {
  GetValueByPath,
  KeyPath,
  Merge,
  MultiMerge,
  Mutable,
  ObjectEntries,
  ObjectKeyUnion,
  ObjectValueUnion,
  SetValueByPath,
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

export function removeUndefinedValues<T extends RecordLike>(obj: T): T {
  return Object.keys(obj).reduce((acc: Partial<T>, key) => {
    if (obj[key] !== undefined) {
      set(acc, key, obj[key]);
    }
    return acc;
  }, {} as Partial<T>) as T;
}

export const getRecordOperator = <const T extends RecordLike>(
  recordData: T,
) => {
  const createAction = <TRecord extends RecordLike>(data: TRecord) => {
    type RecordKeyPath = KeyPath<TRecord>;
    type OnlyKeys<T> = {
      [K in keyof T]: K extends keyof TRecord ? boolean : never;
    };
    type PartialKeyBoolean = Partial<{ [K in keyof TRecord]: boolean }>;

    return {
      getData: () => data,
      pick: <const TMask extends PartialKeyBoolean>(
        mask: TMask & OnlyKeys<TMask>,
      ) => {
        type PickValueType = {
          [K in keyof TMask as TMask[K] extends false ? never : K]: TRecord[K];
        };
        const pickedData = Object.fromEntries(
          Object.entries(data).filter(([key]) => mask[key as keyof TRecord]),
        ) as Prettify<PickValueType>;
        return createAction(pickedData);
      },
      omit: <const TMask extends PartialKeyBoolean>(
        mask: TMask & OnlyKeys<TMask>,
      ) => {
        type OmitValueType = {
          [K in keyof TRecord as TMask[K] extends true ? never : K]: TRecord[K];
        };
        const omittedData = Object.fromEntries(
          Object.entries(data).filter(([key]) => !mask[key as keyof TRecord]),
        ) as Prettify<OmitValueType>;
        return createAction(omittedData);
      },
      getValueByPath: <TKey extends RecordKeyPath>(
        key: TKey,
      ): GetValueByPath<TRecord, TKey> => {
        return get(data, key) as AnyLike;
      },
      merge: <const TData extends RecordLike>(data: TData) => {
        const newData = produce(recordData, (draft: TData) => {
          Object.assign(draft, data);
        });
        return createAction(newData as Merge<TRecord, TData>);
      },
      update: <TKey extends RecordKeyPath, const TData>(
        key: TKey,
        updateData: TData | ((data: GetValueByPath<TRecord, TKey>) => TData),
      ) => {
        const newData = produce(recordData, (draft) => {
          const updateValue = get(draft as TData, key) as GetValueByPath<
            TRecord,
            TKey
          >;
          if (typeof updateData === "function") {
            set(
              draft,
              key,
              (updateData as (data: GetValueByPath<TRecord, TKey>) => TData)(
                updateValue,
              ),
            );
          } else {
            set(draft, key, updateData);
          }
        });
        return createAction(newData as SetValueByPath<TRecord, TKey, TData>);
      },
    };
  };
  return createAction<Mutable<T>>(recordData);
};
