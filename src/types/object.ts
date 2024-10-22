import { ArrayConcat, UnionFromArray } from "./array";
import { RecordKeyLike, RecordLike } from "./like";
import { LastFromUnion, UnionToTuple } from "./shared";
import { GetUnionKeys, RecordByKeyUnion } from "./utils";

export type DeepPartial<T extends RecordLike> = {
  [K in keyof T]?: DeepPartial<T[K] & {}>;
};

export type Mutable<T extends RecordLike> = {
  -readonly [Key in keyof T]: T[Key];
};

export type DeepMutable<T extends RecordLike> = {
  -readonly [Key in keyof T]: DeepMutable<T[Key]&{}>;
};

export type DeepRequired<T extends RecordLike> = {
  [K in keyof T]-?: DeepRequired<T[K]&{}>;
};

export type PickRequired<T extends RecordLike, K extends keyof T> = {
  [P in K]-?: T[P];
} & Omit<T, K>;

export type PickPartial<T extends RecordLike, K extends keyof T> = {
  [P in K]?: T[P];
} & Omit<T, K>;

export type PickExclude<T extends RecordLike, K extends keyof T> = {
  [P in keyof T as Exclude<P, K>]: T[P];
};
export interface DeepRecord<T extends RecordLike> {
  [key: string]: T | DeepRecord<T>;
}

export type DeepReadonly<T extends RecordLike> = {
  readonly [Key in keyof T]: DeepReadonly<T[Key]& {}>;
};

export type PackObject<TKey extends RecordKeyLike, TValue> = {
  [K in TKey]: TValue;
};

export type ObjectKeyUnion<T extends RecordLike> = keyof T;
// type objectKeys = ObjectKeyUnion<{a:1,c:2}>
// "a" | "c"

export type ObjectEntriesUnion<T extends RecordLike> = {
  [K in keyof T]-?: [K, T[K]];
}[keyof T];

export type ObjectEntries<T extends RecordLike> = UnionToTuple<
  ObjectEntriesUnion<DeepMutable<T>>
>;
// type objectEntries = ObjectEntries<{a:1,c:2}>
// [["a", 1], ["c", 2]]

export type ObjectValueUnion<T extends RecordLike> = {
  [K in keyof T]-?: T[K];
}[keyof T];
// type objectValues = ObjectValueUnion<{a:1,c:2}>
// 1 | 2

export type ObjectPathUnion<T> = T extends (infer U)[]
  ? ObjectPathUnion<U>
  : T extends RecordLike
  ? {
      [K in keyof T]-?: K extends ObjectKeyUnion<T>
        ? [K]
        : ArrayConcat<K, ObjectPathUnion<T[K]>>;
    }[keyof T]
  : [];
// type objectPaths = ObjectPaths<{a:{b:{c:1}},c:{f:{g:1}}}>
//["a"] | ["c"]

export type DeepObjectKeyUnion<T> = Exclude<
  T extends RecordLike
    ? LastFromUnion<
        ObjectKeyUnion<T>
      > extends infer Key extends ObjectKeyUnion<T>
      ? [Key] extends [never]
        ? []
        : T[Key] extends RecordLike
        ? UnionFromArray<
            [DeepObjectKeyUnion<Omit<T, Key>>, DeepObjectKeyUnion<T[Key]>, Key]
          >
        : UnionFromArray<[DeepObjectKeyUnion<Omit<T, Key>>, Key]>
      : []
    : [],
  []
>;
//不支持数组
// type deepObjectKeyUnion = DeepObjectKeyUnion<{a:{b:{c:1}},c:{f:{g:1}}}>
//"a" | "c" | "b" | "f" | "g"

export type PickRequiredObjectArr<T extends RecordLike> = ObjectValueUnion<{
  [K in keyof T]: T[K] extends (infer A)[]
    ? T[K] | (A extends RecordLike ? ObjectPickArr<A> : never)
    : T[K] extends RecordLike
    ? ObjectPickArr<T[K]>
    : never;
}>;
// type pickRequiredObjectArr = PickRequiredObjectArr<{a:[123],b:2,c?: [2222]}>
//=> [123]

export type ObjectPickArr<T extends RecordLike> = PickRequiredObjectArr<
  DeepRequired<T>
>;
// type pickObjectArr = ObjectPickArr<{ a?: [123]; b: 2; c: [2222] }>;
//=> [123] | [2222]

export type Merge<TFirst extends RecordLike, TTwo extends RecordLike> = {
  [Key in keyof TFirst | keyof TTwo]: Key extends keyof TTwo
    ? TTwo[Key]
    : Key extends keyof TFirst
    ? TFirst[Key]
    : never;
};
//类型合并
// type merge = Merge<{1:2},{2:1}>
// =>  { 2: 1; 1: 2; }

export type MultiMergeHelper<
  TArrays extends RecordLike[],
  AssignObject extends RecordLike = {}
> = TArrays["length"] extends 0
  ? AssignObject
  : TArrays extends [infer Left, ...infer RightRest]
  ? Left extends RecordLike
    ? RightRest extends RecordLike[]
      ? MultiMergeHelper<RightRest, Merge<AssignObject, Left>>
      : MultiMergeHelper<[], Merge<AssignObject, Left>>
    : Merge<AssignObject, RecordLike>
  : Merge<AssignObject, TArrays[0]>;

export type MultiMerge<TArrays extends RecordLike[]> =
  MultiMergeHelper<TArrays>;
// type assign = MultiMerge<[{1:2},{2:1},{2:2}]>
// => { 2: 2; 1: 2; }

export type MergeFormUnion<RecordUnion extends RecordLike> = RecordByKeyUnion<
  RecordUnion,
  GetUnionKeys<RecordUnion>
>;
// mergeUnionToRecord 会把联合类型对象合并为一个
// type mergeUnionToRecord = MergeUnionToRecord<{ a: 1; b: 2 } | { c: 1; a: 2 }>;
// => { a: 1 | 2; b: 2; c: 1; }
