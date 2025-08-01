import type { FillArray, Join, Length, Reverse, Slice } from "./array";
import type { ArrayListLike, EmptyStringLike, StringFieldLike } from "./like";
import type { Sub } from "./number";

type TrimLeftHelper<S extends string> =
  S extends `${EmptyStringLike}${infer RightRest}`
    ? TrimLeftHelper<RightRest>
    : S;

type TrimRightHelper<S extends string> =
  S extends `${infer LeftRest}${EmptyStringLike}`
    ? TrimRightHelper<LeftRest>
    : S;
/**
 * @description 去除字符串两端的空格
 * @example Trim<"  hello world  "> => "hello world"
 */
export type Trim<S extends string> = TrimLeftHelper<TrimRightHelper<S>>;

/**
 * @description 转换为字符串
 * @example Stringify<123> => "123"
 */
export type Stringify<T extends StringFieldLike> = `${T}`;

/**
 * @description 获取字符串参数名
 * @example GetKeysFromString<"{nickName}次GPT4.0额度"> => ["nickName"]
 */
export type GetKeysFromString<
  Str extends string,
  Keys extends string[] = [],
> = Str extends `${string}{${infer ParamName extends string}}${infer End extends string}`
  ? GetKeysFromString<End, [...Keys, ParamName]>
  : Keys;

/**
 * @description 字符串格式化
 * @example StringFormat<"{nickName}次GPT4.0额度",{nickName: '123123'}> => "123123次GPT4.0额度"
 */
export type StringFormat<
  Str extends string,
  Params extends Record<
    GetKeysFromString<Str>[number],
    string | number | undefined
  >,
> = Str extends `${infer Front extends string}{${infer ParamName}}${infer End extends string}`
  ? ParamName extends keyof Params
    ? StringFormat<`${Front}${Params[ParamName]}${End}`, Params>
    : StringFormat<`${Front}${End}`, Params>
  : Str;

/**
 * @description 字符串连接
 * @example StringConcat<"次GPT4.0额度", '123123'> => "次GPT4.0额度123123"
 */
export type StringConcat<
  TStr extends StringFieldLike,
  UStr extends StringFieldLike,
> = `${TStr}${UStr}`;

/**
 * @description 字符串重复
 * @example StringRepeat<"123", 3> => "123123123"
 */
export type StringRepeat<
  V extends StringFieldLike,
  T extends number,
  U extends StringFieldLike = "",
> = T extends 0 ? U : StringRepeat<V, Sub<T, 1>, `${U}${V}`>;

/**
 * @description 替换字符串
 * @example Replace<"hello world", "l", "L"> => "heLLo world"
 */
export type Replace<
  S extends string,
  MatchStr extends string,
  ReplaceStr extends string,
> = S extends `${infer Left}${MatchStr}${infer Right}`
  ? `${Left}${ReplaceStr}${Right}`
  : S;

/**
 * @description 字符串联合
 * @example CharUnion<'abc'> => "a" | "b" | "c"
 */
export type CharUnion<S extends string> = S extends `${infer Char}${infer Rest}`
  ? Char | CharUnion<Rest>
  : never;

type SplitHelper<
  S extends StringFieldLike,
  U extends string = "",
  C extends string[] = [],
> = `${S}` extends `${infer Char}${U}${infer Rest}`
  ? SplitHelper<Rest, U, [...C, Char]>
  : [...C, S];

/**
 * @description 字符串分割
 * @example Split<"1asdas.22", "."> => ["1asdas", "22"]
 */
export type Split<
  S extends StringFieldLike,
  U extends string = "",
> = SplitHelper<S, U>;

/**
 * @description 字符串反转
 * @example StringReverse<'asdfghj'> => "jhgfdsa"
 */
export type StringReverse<S extends StringFieldLike> = Join<Reverse<Split<S>>>;

/**
 * @description 获取字符串长度
 * @example StringLength<'asdfghj'> => 7
 */
export type StringLength<S extends StringFieldLike> = Length<
  Split<Stringify<S>>
>;

type SubStringHelper<
  Str extends StringFieldLike,
  F extends number,
  E extends number = StringLength<Str>,
  Arr extends ArrayListLike = Split<Str>,
> = Slice<Arr, F, E>;

/**
 * @description 获取指定索引范围的子字符串
 * @example SubString<'asdfghj',2> => "dfghj"
 */
export type SubString<
  Str extends StringFieldLike,
  F extends number,
  E extends number = StringLength<Str>,
> = Join<SubStringHelper<Str, F, E>>;
// type subString = SubString<'asdfghj',2>
// "dfghj"

/**
 * @description 获取指定索引处的字符
 * @example CharAt<'asdfghj',2> => "d"
 */
export type CharAt<
  Str extends StringFieldLike,
  N extends number,
> = Split<Str>[N];

/**
 * @description 字符串是否以指定字符串开头
 * @example StartWith<"StartsWith", "St"> => true
 */
export type StartWith<
  Str extends StringFieldLike,
  CompareStr extends string,
> = `${CompareStr}${SubString<Str, StringLength<CompareStr>>}` extends Str
  ? true
  : false;

/**
 * @description 字符串是否以指定字符串结尾
 * @example EndWith<"StartsWith", "th"> => true
 */
export type EndWith<
  Str extends StringFieldLike,
  CompareStr extends string,
> = `${SubString<
  Str,
  0,
  Sub<StringLength<Str>, StringLength<CompareStr>>
>}${CompareStr}` extends Str
  ? true
  : false;

type FillStringLengthHelper<
  Str extends StringFieldLike,
  Length extends number,
  FillStr extends StringFieldLike,
  direction extends "start" | "end" = "start",
  AddLength extends number = Sub<Length, StringLength<Str>>,
  FillString extends string = Join<FillArray<AddLength, FillStr>>,
> = direction extends "start"
  ? StringConcat<FillString, Str>
  : StringConcat<Str, FillString>;

/**
 * @description 字符串左侧填充指定长度
 * @example StartFillStringLength<"123", 6, "0"> => "000123"
 */
export type StartFillStringLength<
  Str extends StringFieldLike,
  Length extends number,
  FillStr extends StringFieldLike = " ",
> = FillStringLengthHelper<Str, Length, FillStr, "start">;

/**
 * @description 字符串右侧填充指定长度
 * @example EndFillStringLength<"123", 6, "0"> => "123000"
 */
export type EndFillStringLength<
  Str extends StringFieldLike,
  Length extends number,
  FillStr extends StringFieldLike = " ",
> = FillStringLengthHelper<Str, Length, FillStr, "end">;

/**
 * @description 排除特定子字符串
 * @example ExcludeSubstrings<"123123456", "123"> => "456"
 * @example ExcludeSubstrings<"123" | "456" | "789", "123"> => "456" | "789"
 * @example ExcludeSubstrings<"/" | "home" | "dataset" | "dataset/:id", "/:"> => "/" | "home" | "dataset"
 */
export type ExcludeSubstrings<
  T extends string,
  U extends string,
> = T extends `${infer _Prefix}${U}${infer _Suffix}` ? never : T;

export type IncludeString<
  T extends string,
  U extends string,
> = T extends `${string}${U}${string}` ? true : false;
