import { get, isArray, set } from "lodash-es";
import type { ExtractDynamicUrlParams } from "../types/extract";
import type { AnyLike, RecordLike } from "../types/like";
import type {
  DynamicUrlReplaceParams,
  ExtractUrlQuery,
  ParseRecordUrlQuery,
} from "../types/url";

/**
 * @example
 *  queryStringify({a: 1, b: [2, 3], c: undefined}) // "a=1&b=2&b=3"
 */
export function queryStringify<T extends RecordLike>(obj: T) {
  const query = [];
  if (obj) {
    for (const key in obj) {
      const value = obj[key];
      if (value === undefined) continue;
      if (value && isArray(value)) {
        (value as Array<AnyLike>).forEach((item: unknown) => {
          query.push("".concat(key, "=", `${item}`));
        });
      } else {
        query.push("".concat(key, "=", `${value}`));
      }
    }
  }
  return query.join("&") as ParseRecordUrlQuery<T>;
}

/**
 * @example
 *  extractQueryString("a=1&b=2&b=3") // {a: "1", b: ["2", "3"]}
 */
export function extractQueryString<T extends string>(
  value: T,
): ExtractUrlQuery<T> {
  const param = {};
  value.split("&").forEach((item) => {
    const [key, value] = item.split("=");
    if (key && get(param, key) === undefined) {
      set(param, key, value);
    } else {
      if (key) set(param, key, [get(param, key), value].flat());
    }
  });
  return param as AnyLike;
}

/**
 * @example
 *  fillDynamicUrlParams("/users/:id", {id: 123}) // "/users/123"
 * @param {string } path - 路由路劲 如 "/users/:id"
 * @param {Record<string, string>} params - 路由参数 如 {id: 123}
 */
export function dynamicUrlReplaceParams<
  T extends `${string}:${string}` | string,
  U extends ExtractDynamicUrlParams<T> & RecordLike,
>(
  path: T,
  params: { [K in U & string]: string },
): DynamicUrlReplaceParams<T, U> {
  return path.replace(/:([^/]+)/g, (match, key: U) => {
    return params[key] !== undefined ? `${params[key]}` : match;
  }) as AnyLike;
}
