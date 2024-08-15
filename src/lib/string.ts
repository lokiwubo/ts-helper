import { FillArray, Join, Length, Reverse, Slice } from "./array";
import { ArrayListLike, EmptyStringLike, StringifiedLike } from "./like";
import { Sub } from "./number";

type TrimLeftHelper<S extends string> =
  S extends `${EmptyStringLike}${infer RightRest}`
    ? TrimLeftHelper<RightRest>
    : S;

type TrimRightHelper<S extends string> =
  S extends `${infer LeftRest}${EmptyStringLike}`
    ? TrimRightHelper<LeftRest>
    : S;

export type Trim<S extends string> = TrimLeftHelper<TrimRightHelper<S>>;

export type Stringify<T extends StringifiedLike> = `${T}`;

export type GetKeysFromString<
  Str extends string,
  Keys extends string[] = []
> = Str extends `${string}{${infer ParamName extends string}}${infer End extends string}`
  ? GetKeysFromString<End, [...Keys, ParamName]>
  : Keys;

// type  getKeysFromString =  GetKeysFromString<"{nickName}次GPT4.0额度">
// =>["nickName"]

export type StringFormat<
  Str extends string,
  Params extends Record<
    GetKeysFromString<Str>[number],
    string | number | undefined
  >
> = Str extends `${infer Front extends string}{${infer ParamName}}${infer End extends string}`
  ? ParamName extends keyof Params
    ? StringFormat<`${Front}${Params[ParamName]}${End}`, Params>
    : StringFormat<`${Front}${End}`, Params>
  : Str;
// type  formatString =  StringFormat<"{nickName}次GPT4.0额度",{nickName: '123123'}>
// =>"123123次GPT4.0额度"

export type StringConcat<
  TStr extends StringifiedLike,
  UStr extends StringifiedLike
> = `${TStr}${UStr}`;
// type  stringConcat =  StringConcat<"次GPT4.0额度",'123123'>
// =>"次GPT4.0额度123123"

export type StringRepeat<
  V extends StringifiedLike,
  T extends number,
  U extends StringifiedLike = ""
> = T extends 0 ? U : StringRepeat<V, Sub<T, 1>, `${U}${V}`>;
// type stringRepeat = StringRepeat <"123", 3>;
//"123123123"

export type Replace<
  S extends string,
  MatchStr extends string,
  ReplaceStr extends string
> = S extends `${infer Left}${MatchStr}${infer Right}`
  ? `${Left}${ReplaceStr}${Right}`
  : S;

export type CharUnion<S extends string> = S extends `${infer Char}${infer Rest}`
  ? Char | CharUnion<Rest>
  : never;

type SplitHelper<
  S extends StringifiedLike,
  U extends string = "",
  C extends string[] = []
> = `${S}` extends `${infer Char}${U}${infer Rest}`
  ? SplitHelper<Rest, U, [...C, Char]>
  : [...C, S];

export type Split<
  S extends StringifiedLike,
  U extends string = ""
> = SplitHelper<S, U>;
// type split = Split<"1asdas.22", ".">;
// ["1asdas", "22"]

export type StringReverse<S extends StringifiedLike> = Join<Reverse<Split<S>>>;
// type stringReverse = StringReverse<'asdfghj'>
// "jhgfdsa"

export type StringLength<S extends StringifiedLike> = Length<
  Split<Stringify<S>>
>;

// type stringLength = StringLength<'asdfghj'>
// 7
type SubStringHelper<
  Str extends StringifiedLike,
  F extends number,
  E extends number = StringLength<Str>,
  Arr extends ArrayListLike = Split<Str>
> = Slice<Arr, F, E>;

export type SubString<
  Str extends StringifiedLike,
  F extends number,
  E extends number = StringLength<Str>
> = Join<SubStringHelper<Str, F, E>>;
// type subString = SubString<'asdfghj',2>
// "dfghj"

export type CharAt<
  Str extends StringifiedLike,
  N extends number
> = Split<Str>[N];
// type charAt = CharAt<'asdfghj',2>
// "d"

export type StartWith<
  Str extends StringifiedLike,
  CompareStr extends string
> = `${CompareStr}${SubString<Str, StringLength<CompareStr>>}` extends Str
  ? true
  : false;
// type startWith = StartWith<"123", "1">;
// true

export type EndWith<
  Str extends StringifiedLike,
  CompareStr extends string
> = `${SubString<
  Str,
  0,
  Sub<StringLength<Str>, StringLength<CompareStr>>
>}${CompareStr}` extends Str
  ? true
  : false;
// type endWith = EndWith<"StartsWith", "th">;
// true

type FillStringLengthHelper<
  Str extends StringifiedLike,
  Length extends number,
  FillStr extends StringifiedLike,
  direction extends "start" | "end" = "start",
  AddLength extends number = Sub<Length, StringLength<Str>>,
  FillString extends string = Join<FillArray<AddLength, FillStr>>
> = direction extends "start"
  ? StringConcat<FillString, Str>
  : StringConcat<Str, FillString>;

export type StartFillStringLength<
  Str extends StringifiedLike,
  Length extends number,
  FillStr extends StringifiedLike = " "
> = FillStringLengthHelper<Str, Length, FillStr, "start">;
// type startFillStringLength = StartFillStringLength<"123", 6, "0">;
// "000123"

export type EndFillStringLength<
  Str extends StringifiedLike,
  Length extends number,
  FillStr extends StringifiedLike = " "
> = FillStringLengthHelper<Str, Length, FillStr, "end">;
// type endFillStringLength = EndFillStringLength<"123", 6, "0">;
// "123000"
