import { UnionFromArray } from './array';
import { ArrayListLike, RecordKeyLike, RecordLike } from './like';
import {
  ObjectKeyUnion,
  ObjectPickArr,
  ObjectValueUnion,
} from './object';
import { LastFromUnion } from './shared';

export type GetUnionKeys<RecordUnion extends RecordLike> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordUnion extends any
    ? {
        [key in keyof RecordUnion]: key;
      } extends {
        [key in keyof RecordUnion]: infer K;
      }
      ? K
      : never
    : never;
//获取联合类型里的所有key
// type getUnionKeys = GetUnionKeys<{a:1}| {v:2}>
// =>  "a" | "v"

export type RecordByKeyUnion<
  RecordUnion extends RecordLike,
  KeyUnion extends RecordKeyLike
> = {
  [key in KeyUnion]: {
    [k in keyof RecordUnion]: k extends key ? RecordUnion[k] : never;
  } extends {
    [k in keyof RecordUnion]: infer P;
  }
    ? P
    : never;
};
// 创建record 通过获取联合类型里的所有key
// type recordByUnionKey = RecordByKeyUnion< { a: 1; b: 2 } | { c: 1; a: 2 }, "b" | "a" >;
// => { b: 2; a: 1 | 2; }

export type GetDiffRecord<
  TRecord extends RecordLike,
  URecord extends RecordLike
> = {
  [K in Exclude<GetUnionKeys<TRecord>, ObjectKeyUnion<URecord>>]?: never;
};

// GetDiffRecord 里获取URecord 对象里不含key的Record
// type getDiffRecord = GetDiffRecord<{ a: 1; b: 2 }, { c: 1; a: 2 }>;
// => { b?: undefined; }

export type PickArrayFromUnion<T extends RecordLike | RecordLike[]> =
  T extends (infer U)[]
    ? U extends RecordLike
      ? T | ObjectPickArr<U>
      : never
    : T extends RecordLike
    ? ObjectPickArr<T>
    : never;

//获取对象里的所有数组类型
// type pickAllArrays = PickArrayFromUnion<{ a: [{ a: [1, 2, 3] }, 2] }>;
//[1, 2, 3] | [DeepRequired<{ a: [1, 2, 3]; }>, 2]

export type Exclusive<
  TRecordUnion extends RecordLike,
  URecordUnion extends RecordLike = TRecordUnion
> = TRecordUnion extends URecordUnion
  ? TRecordUnion & GetDiffRecord<URecordUnion, TRecordUnion>
  : never;
//把自身设置为唯一 其他不同key的值设为never
// type exclusive = Exclusive<{a:2,b:2,c:{success: true,}} | {a:2,b:2,c:{success: false,errorMsg: '1231'}}>
// const a:exclusive = {a:2,b:2,c:{success: true, errorMsg: '1231'}}

type GetRecordTupleFromDeepObject<
  T extends RecordLike,
  I extends ArrayListLike = []
> = LastFromUnion<T> extends RecordLike
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
//可以深度遍历对象获取record 对象数组   可以用在给数据分类校验使用
// type getRecordTupleFromDeepObject = GetRecordTupleFromDeepObject<{a: 1, b:[{c:1}]}>
// => [{ a: 1; b: [{ c: 1; }]; }, { c: 1; }]

export type GetRecordUnionFromObject<T extends RecordLike> = UnionFromArray<
  GetRecordTupleFromDeepObject<T>
>;
// type getRecordUnionFromObject = GetRecordUnionFromObject<{a: 1, b:[{c:1}]}>
// => { c: 1; } | { a: 1; b: [{ c: 1; }]; }
