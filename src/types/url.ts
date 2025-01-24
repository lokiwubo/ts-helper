import type { ArrayConcat } from "./array";
import type { ExtractDynamicUrlParams } from "./extract";
import type { AnyLike, DynamicUrlLike, RecordLike, UrlValueLike } from "./like";
import type { ObjectEntries } from "./object";
import type { StringConcat, Trim } from "./string";
import type { Get } from "./utils";

/**
 * @description 用来解析url中的query参数只能解析一个值 并返回一个对象
 * @example type parseQueryRecord = ParseQueryRecord<"a=1"> => { a: "1" }
 */
type ParseQueryRecord<UrlQuery extends string> =
  UrlQuery extends `${infer Key}=${infer Value}`
    ? {
        [K in Key as Trim<K>]: Trim<Value>;
      }
    : {};

/**
 * @description 用来合并两个query参数
 * @example type mergeParams = MergeParams<{a:1,b:2},{a:2}> => { a: [1, 2]; b: 2; }
 */
type MergeParams<OneParam extends RecordLike, OtherParam extends RecordLike> = {
  [Key in keyof OneParam | keyof OtherParam]: Key extends keyof OneParam
    ? Key extends keyof OtherParam
      ? ArrayConcat<OneParam[Key], OtherParam[Key]>
      : OneParam[Key]
    : Key extends keyof OtherParam
      ? OtherParam[Key]
      : never;
};

/**
 * @description 用来提取url中的query参数
 * @example type extractUrlQuery = ExtractUrlQuery<"a=1&b=4&a=2"> => { a: ["1", "2"]; b: "4"; }
 */
export type ExtractUrlQuery<Str extends string> =
  Str extends `${infer Param}&${infer Rest}`
    ? MergeParams<ParseQueryRecord<Param>, ExtractUrlQuery<Rest>>
    : ParseQueryRecord<Str>;

type ArrMapToStringHelper<
  TValues extends unknown[],
  TKey extends UrlValueLike,
  TString extends string = ``,
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
  TString extends string = ``,
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
            StringConcat<
              TString,
              ArrMapToStringHelper<Current[1], Current[0], "">
            >
          >
        : TString
    : TString;
/**
 * @description 用来组装query的参数
 * @example type parseRecordUrlQuery=  ParseRecordUrlQuery<{a:1,b:[2,true]> => "a=1&b=2&b=true"
 * @returns { string }
 */
export type ParseRecordUrlQuery<
  Params extends RecordLike,
  Url extends string = "",
> = EntriesToString<ObjectEntries<Params>, Url>;

type ParseParam<Key extends string> = { [K in Key]: string };

/**
 * @description 用来解析url中的参数
 * @example  dynamicUrlParseParams = DynamicUrlParseParams<'/:id/:name/:age'> =>{id: string; name: string; age: string}
 * @returns { string }
 */
export type DynamicUrlParseParams<Str extends string> = ParseParam<
  ExtractDynamicUrlParams<Str>
>;

/**
 * 填充/前缀路径
 * @example type prefixedRoutePath= PrefixedRoutePath<"a"> => "/a"
 */
export type PrefixedRoutePath<T extends string> = T extends `/${infer _}`
  ? never
  : `/${T}`;

/**
 * 判断是否有params参数
 * @example type isDynamicUrl= HasParam<"/a/:b/:c"> => true
 */
export type IsDynamicUrl<T extends string> =
  T extends `${infer _Start}/:${infer _Param}`
    ? true
    : T extends `${infer _Start}/${infer Rest}`
      ? IsDynamicUrl<Rest>
      : false;

/**
 * Url替换params参数
 * @example type urlReplaceParams= UrlReplaceParams<'/a/:b/:c', {b: '123', c: "dddg"}> => "/a/123/dddg"
 */
export type DynamicUrlReplaceParams<
  TUrl extends DynamicUrlLike | string,
  TParams extends {
    [K in ExtractDynamicUrlParams<TUrl>]: AnyLike;
  } & RecordLike,
> = TUrl extends `${infer Before}:${infer Key}/${infer After}`
  ? DynamicUrlReplaceParams<
      After & DynamicUrlLike,
      TParams
    > extends `${infer AfterReplaced}`
    ? `${Before}${Get<TParams, `${Key}`, "">}/${AfterReplaced}`
    : never
  : TUrl extends `${infer Before}:${infer Key}`
    ? `${Before}${Get<TParams, `${Key}`, "">}`
    : TUrl;
