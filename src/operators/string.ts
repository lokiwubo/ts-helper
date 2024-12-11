import { AnyLike } from "../types";
import { GetKeysFromString, StringFormat } from "../types/string";

/**
 * @description 移除 string 字符串两端的空白字符和幽灵连接符
 */
export function trimWhiteSpaces(text: string) {
  let out_text = text.trim();
  const whiteSpaceCodes = [0x200e, 0x2022];
  while (
    out_text.length !== 0 &&
    whiteSpaceCodes.indexOf(out_text.charCodeAt(0)) !== -1
  ) {
    out_text = out_text.slice(1);
  }
  while (
    out_text.length !== 0 &&
    whiteSpaceCodes.indexOf(out_text.charCodeAt(out_text.length - 1)) !== -1
  ) {
    out_text = out_text.slice(0, out_text.length - 1);
  }
  return out_text;
}

export function hexToRgba<T extends `#${string}` | string>(
  bgColor: T,
  alpha: number = 1,
) {
  const color = bgColor.slice(1);
  const rgba = [
    parseInt("0x" + color.slice(0, 2)),
    parseInt("0x" + color.slice(2, 4)),
    parseInt("0x" + color.slice(4, 6)),
    alpha,
  ];
  return "rgba(" + rgba.toString() + ")";
}

export function hashString(text: string) {
  let hash = 0;
  if (text) {
    for (let i = 0; i < text.length; i++) {
      hash += text.charCodeAt(i) * i;
      if (hash > Number.MAX_SAFE_INTEGER || hash < Number.MIN_SAFE_INTEGER) {
        hash &= 0xffffffff;
      }
    }
  }
  return hash;
}
/**
 * @description 格式化字符串
 * @example
 * formatString("Hello {name}, your age is {age}", {name: "John", age: 30})
 */
export function formatString<
  T extends string,
  O extends Record<GetKeysFromString<T>[number], string | number | undefined>,
>(text: T, params?: O): O extends undefined ? T : StringFormat<T, O> {
  let result = String(text);
  if (text.length > 0 && params) {
    if (params instanceof Object && !Array.isArray(params)) {
      for (const key in params) {
        const reg = new RegExp("({" + key + "})", "g");
        const value = params[key];
        result = result.replace(reg, `${value}`);
      }
    } else if (Array.isArray(params)) {
      result = result.replace(/\{(\d+)\}/g, function (_s, i) {
        return String(params[i]);
      });
    }
  }
  return result as AnyLike;
}
