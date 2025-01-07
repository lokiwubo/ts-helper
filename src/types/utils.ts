import type { UnionFromArray } from "./array";
import type { AnyLike, ArrayListLike, RecordKeyLike, RecordLike } from "./like";
import type { ObjectKeyUnion, ObjectPickArr, ObjectValueUnion } from "./object";
import type { LastFromUnion } from "./shared";

/**
 * @description 获取联合类型里的所有key
 * @example
 * type getUnionKeys = GetUnionKeys<{a:1}| {v:2}>  => "a" | "v"
 */
export type GetUnionKeys<RecordUnion extends RecordLike> =
  RecordUnion extends AnyLike
    ? {
        [key in keyof RecordUnion]: key;
      } extends {
        [key in keyof RecordUnion]: infer K;
      }
      ? K
      : never
    : never;

/**
 * @description 获取 RecordByKeyUnion 里的key 对应的值
 * @example recordByUnionKey = RecordByKeyUnion< { a: 1; b: 2 } | { c: 1; a: 2 }, "b" | "a" >  => { b: 2; a: 1 | 2; }
 */
export type RecordByKeyUnion<
  RecordUnion extends RecordLike,
  KeyUnion extends RecordKeyLike,
> = {
  [key in KeyUnion]: {
    [k in keyof RecordUnion]: k extends key ? RecordUnion[k] : never;
  } extends {
    [k in keyof RecordUnion]: infer P;
  }
    ? P
    : never;
};

/**
 * @description 获取 TRecord 里不在 URecord 里的key
 * @example getDiffRecord = GetDiffRecord<{ a: 1; b: 2 }, { c: 1; a: 2 }>  => { b?: undefined; }
 */
export type GetDiffRecord<
  TRecord extends RecordLike,
  URecord extends RecordLike,
> = {
  [K in Exclude<GetUnionKeys<TRecord>, ObjectKeyUnion<URecord>>]?: never;
};

/**
 * @description 获取 TRecord 里的key 对应的值
 * @example getRecordValue = GetRecordValue<{ a: 1; b: 2 }, "a" | "b">  => { a: 1; b: 2; }
 */
export type PickArrayFromUnion<T extends RecordLike | RecordLike[]> =
  T extends (infer U)[]
    ? U extends RecordLike
      ? T | ObjectPickArr<U>
      : never
    : T extends RecordLike
      ? ObjectPickArr<T>
      : never;

/**
 * @description 把自身设置为唯一 其他不同key的值设为never
 * @description 用于对象合并时，排除相同key的情况
 * @example Exclusive<{a:2,b:2,c:{success: true,}} | {a:2,b:2,c:{success: false,errorMsg: '1231'}}> => {a:2,b:2,c:{success: true,}}
 */
export type Exclusive<
  TRecordUnion extends RecordLike,
  URecordUnion extends RecordLike = TRecordUnion,
> = TRecordUnion extends URecordUnion
  ? TRecordUnion & GetDiffRecord<URecordUnion, TRecordUnion>
  : never;

/**
 * @description 获取对象里所有record的数组类型
 * @example GetRecordTupleFromDeepObject<{a: 1, b:[{c:1}]}> => [{ a: 1; b: [{ c: 1; }]; }, { c: 1; }]
 */
type GetRecordTupleFromDeepObject<
  T extends RecordLike,
  I extends ArrayListLike = [],
> =
  LastFromUnion<T> extends RecordLike
    ? LastFromUnion<T> extends ArrayListLike
      ? GetRecordTupleFromDeepObject<
          Exclude<T, LastFromUnion<T>> | LastFromUnion<T>[number],
          I
        >
      : GetRecordTupleFromDeepObject<
          Exclude<T, LastFromUnion<T>> | ObjectValueUnion<LastFromUnion<T>>,
          [...I, LastFromUnion<T>]
        >
    : I;

/**
 * @description 获取对象里所有record的联合类型
 * @example GetRecordUnionFromObject<{a: 1, b:[{c:1}]}> => { c: 1; } | { a: 1; b: [{ c: 1; }]; }
 */
export type GetRecordUnionFromObject<T extends RecordLike> = UnionFromArray<
  GetRecordTupleFromDeepObject<T>
>;

// type Without<FirstType, SecondType> = {
//   [KeyType in Exclude<keyof FirstType, keyof SecondType>]?: never;
// };

// type MergeExclusive<FirstType, SecondType> =
//   | FirstType
//   | SecondType extends object
//   ?
//       | (Without<FirstType, SecondType> & SecondType)
//       | (Without<SecondType, FirstType> & FirstType)
//   : FirstType | SecondType;
