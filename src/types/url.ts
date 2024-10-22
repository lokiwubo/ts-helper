import { ArrayConcat } from "./array";
import { RecordLike, UrlValueLike } from "./like";
import { ObjectEntries } from "./object";
import { StringConcat, Trim } from "./string";

type ParseQueryRecord<UrlQuery extends string> =
  UrlQuery extends `${infer Key}=${infer Value}`
    ? {
        [K in Key as Trim<K>]: Trim<Value>;
      }
    : {};
// 用于 单个 query
// type urlQueryParseRecord = ParseQueryRecord<"a=1">
// { a: 1 }

type MergeParams<OneParam extends RecordLike, OtherParam extends RecordLike> = {
  [Key in keyof OneParam | keyof OtherParam]: Key extends keyof OneParam
    ? Key extends keyof OtherParam
      ? ArrayConcat<OneParam[Key], OtherParam[Key]>
      : OneParam[Key]
    : Key extends keyof OtherParam
    ? OtherParam[Key]
    : never;
};
//用于 url query
// type mergeParams = MergeParams<{a:1,b:2},{a:2}>
// { a: [1, 2]; b: 2; }

export type ParseUrlQueryString<Str extends string> =
  Str extends `${infer Param}&${infer Rest}`
    ? MergeParams<ParseQueryRecord<Param>, ParseUrlQueryString<Rest>>
    : ParseQueryRecord<Str>;
// type parseUrlQueryString = ParseUrlQueryString<"a=1& b =4& a= 2">;
// =>{ a: ["1", "2"]; b: "4"; }

type ArrMapToStringHelper<
  TValues extends unknown[],
  TKey extends UrlValueLike,
  TString extends string = ``
> = TValues["length"] extends 0
  ? TString
  : TValues extends [infer Current, ...infer Other]
  ? ArrMapToStringHelper<
      Other,
      TKey,
      StringConcat<TString, `&${TKey}=${Current & UrlValueLike}`>
    >
  : TString;

type EntriesToString<
  TArray extends unknown[],
  TString extends string = ``
> = TArray["length"] extends 0
  ? TString
  : TArray extends [infer Current, ...infer Other]
  ? Current extends [string, UrlValueLike]
    ? EntriesToString<
        Other,
        `${TString extends ""
          ? `${Current[0]}=${Current[1]}`
          : StringConcat<TString, `&${Current[0]}=${Current[1]}`>}`
      >
    : Current extends [string, UrlValueLike[]]
    ? EntriesToString<
        Other,
        StringConcat<TString, ArrMapToStringHelper<Current[1], Current[0], "">>
      >
    : TString
  : TString;

export type ParseRecordUrlQuery<
  Params extends RecordLike,
  Url extends string = ""
> = EntriesToString<ObjectEntries<Params>, Url>;

// type parseRecordUrlQuery=  ParseRecordUrlQuery<{a:1,b:[2,true]}>
// => "a=1&b=2&b=true"
